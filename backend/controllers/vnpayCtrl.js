const crypto = require('crypto');
const Payments = require('../models/Payment');
const Users = require('../models/User');
const Courses = require('../models/Course');
// chuan hoa du lieu dau vao.
const normalize = (value) => String(value || '').trim();
// sap xep object theo key.
const sortObject = (obj) => {
    const sorted = {};
    Object.keys(obj || {}).sort().forEach((key) => {
        sorted[key] = obj[key];
    });
    return sorted;
};
// tao du lieu phu tro cho luong xu ly.
const buildQuery = (params) => {
    const sorted = sortObject(params);
    return Object.keys(sorted)
        .map((key) => `${key}=${encodeURIComponent(String(sorted[key])).replace(/%20/g, '+')}`)
        .join('&');
};
// hoan tat don thanh toan va cap quyen hoc.
const fulfillPayment = async (paymentDoc) => {
    if (!paymentDoc || paymentDoc.isFulfilled) return;

    const user = await Users.findById(paymentDoc.user_id);
    if (!user) return;

    const cartItems = Array.isArray(paymentDoc.cart) ? paymentDoc.cart : [];
    const courseIds = cartItems.map((item) => String(item?._id || '')).filter(Boolean);
    if (courseIds.length === 0) {
        paymentDoc.isFulfilled = true;
        await paymentDoc.save();
        return;
    }

    await Users.findOneAndUpdate({ _id: paymentDoc.user_id }, {
        $addToSet: { enrolledCourses: { $each: courseIds } },
        $pull: { cart: { _id: { $in: courseIds } } }
    });

    for (const courseId of courseIds) {
        await Courses.findOneAndUpdate({ _id: courseId }, { $inc: { studentCount: 1 } });
    }

    paymentDoc.isFulfilled = true;
    await paymentDoc.save();
};
// xac minh chu ky VNPAY.
const verifyVnpSignature = (query) => {
    const secureHash = normalize(query?.vnp_SecureHash);
    if (!secureHash) return false;

    const hashSecret = normalize(process.env.VNP_HASHSECRET);
    if (!hashSecret) return false;

    const source = query || {};
    const vnpParams = {};

    Object.keys(source).forEach((key) => {
        if (!String(key).startsWith('vnp_')) return;
        if (key === 'vnp_SecureHash' || key === 'vnp_SecureHashType') return;
        vnpParams[key] = source[key];
    });

    const signData = buildQuery(vnpParams);
    const signed = crypto.createHmac('sha512', hashSecret).update(Buffer.from(signData, 'utf-8')).digest('hex');
    return secureHash.toLowerCase() === signed.toLowerCase();
};
// phan tich du lieu dau vao ve dinh dang can dung.
const parseAmount = (value) => {
    const normalized = String(value || '').replace(/[^0-9.-]/g, '');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
};
// cap nhat thanh toan thanh cong.
const applySuccessfulPayment = async (payment, query) => {
    if (!payment) return;

    if (String(payment.status).toLowerCase() !== 'paid') {
        payment.status = 'paid';
        payment.gateway = 'VNPAY';
        payment.transferType = 'in';
        payment.transferAmount = Number(payment.total || 0);
        payment.transactionDate = normalize(query?.vnp_PayDate);
        payment.referenceCode = normalize(query?.vnp_TransactionNo);
        payment.accountNumber = normalize(query?.vnp_BankCode);
        payment.paidAt = new Date();
    }

    payment.webhookRaw = query;
    await payment.save();
    await fulfillPayment(payment);
};

const vnpayCtrl = {
// xu ly callback IPN tu VNPAY.
    ipn: async (req, res) => {
        try {
            if (!verifyVnpSignature(req.query)) {
                return res.status(200).json({ RspCode: '97', Message: 'Fail checksum' });
            }

            const txnRef = normalize(req.query.vnp_TxnRef);
            const responseCode = normalize(req.query.vnp_ResponseCode);
            const transactionStatus = normalize(req.query.vnp_TransactionStatus);
            const amount = parseAmount(req.query.vnp_Amount) / 100;

            const payment = await Payments.findOne({ paymentID: txnRef }).sort({ createdAt: -1 });
            if (!payment) {
                return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
            }

            if (String(payment.status).toLowerCase() === 'paid') {
                return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
            }

            if (Math.round(Number(payment.total || 0)) !== Math.round(amount)) {
                return res.status(200).json({ RspCode: '04', Message: 'Invalid amount' });
            }

            if (responseCode === '00' && transactionStatus === '00') {
                await applySuccessfulPayment(payment, req.query);

                return res.status(200).json({ RspCode: '00', Message: 'success' });
            }

            return res.status(200).json({ RspCode: '00', Message: 'acknowledged' });
        } catch (error) {
            return res.status(200).json({ RspCode: '99', Message: error.message || 'Unknown error' });
        }
    },
// xu ly URL tra ve tu VNPAY.
    returnUrl: async (req, res) => {
        try {
            const checksumValid = verifyVnpSignature(req.query);
            const frontendBaseUrl = String(process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
            const paymentId = normalize(req.query.paymentId);
            const txnRef = normalize(req.query.vnp_TxnRef);
            const amount = parseAmount(req.query.vnp_Amount) / 100;

            let gatewayResult = 'error';
            if (checksumValid) {
                const responseCode = normalize(req.query.vnp_ResponseCode);
                const transactionStatus = normalize(req.query.vnp_TransactionStatus);
                if (responseCode === '00' && transactionStatus === '00') gatewayResult = 'success';
                else if (responseCode === '24') gatewayResult = 'cancel';
                else gatewayResult = 'error';
            }

            let resolvedPaymentId = paymentId;
            let paymentDoc = null;
            if (!resolvedPaymentId && txnRef) {
                paymentDoc = await Payments.findOne({ paymentID: txnRef });
                resolvedPaymentId = paymentDoc ? String(paymentDoc._id) : '';
            } else if (resolvedPaymentId) {
                paymentDoc = await Payments.findById(resolvedPaymentId);
            }

            if (!paymentDoc && txnRef) {
                paymentDoc = await Payments.findOne({ paymentID: txnRef });
            }

            if (
                checksumValid &&
                gatewayResult === 'success' &&
                paymentDoc &&
                Math.round(Number(paymentDoc.total || 0)) === Math.round(amount)
            ) {
                await applySuccessfulPayment(paymentDoc, req.query);
            }

            const redirectUrl = `${frontendBaseUrl}/?paymentId=${encodeURIComponent(resolvedPaymentId)}&gatewayResult=${gatewayResult}`;
            return res.redirect(302, redirectUrl);
        } catch {
            return res.redirect(302, `${String(process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')}/?gatewayResult=error`);
        }
    }
};

module.exports = vnpayCtrl;