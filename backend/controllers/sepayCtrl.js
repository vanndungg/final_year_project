const Payments = require('../models/Payment');
const Users = require('../models/User');
const Courses = require('../models/Course');

const SEPAY_ALLOWLIST = new Set([
    '172.236.138.20',
    '172.233.83.68',
    '171.244.35.2',
    '151.158.108.68',
    '151.158.109.79',
    '103.255.238.139'
]);

const normalizeCode = (value) => String(value || '').trim();

const parseAmount = (value) => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const normalized = String(value || '').replace(/[^0-9.,-]/g, '').replace(/,/g, '');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
};

const extractPaymentCode = (payload) => {
    const code = normalizeCode(payload?.code);
    if (code) return code;

    const content = `${normalizeCode(payload?.content)} ${normalizeCode(payload?.description)}`;
    const match = content.match(/EDU[A-Z0-9]{8,}/i);
    return match ? match[0].toUpperCase() : '';
};

const getClientIp = (req) => {
    const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    if (forwarded) return forwarded;
    return String(req.ip || req.connection?.remoteAddress || '').replace('::ffff:', '');
};

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

const sepayCtrl = {
    webhook: async (req, res) => {
        try {
            const strictIp = String(process.env.SEPAY_STRICT_IP || 'false').toLowerCase() === 'true';
            if (strictIp) {
                const clientIp = getClientIp(req);
                if (!SEPAY_ALLOWLIST.has(clientIp)) {
                    return res.status(403).json({ success: false, msg: 'IP not allowed' });
                }
            }

            const payload = req.body || {};

            // Payment Gateway IPN format
            const notificationType = normalizeCode(payload.notification_type).toUpperCase();
            const orderStatus = normalizeCode(payload?.order?.order_status).toUpperCase();
            const transactionStatus = normalizeCode(payload?.transaction?.transaction_status).toUpperCase();
            const isGatewayPaidEvent =
                notificationType === 'ORDER_PAID' ||
                (orderStatus === 'CAPTURED' && transactionStatus === 'APPROVED');

            if (isGatewayPaidEvent) {
                const invoiceCandidates = [
                    normalizeCode(payload?.order?.order_invoice_number),
                    normalizeCode(payload?.order?.order_id),
                    normalizeCode(payload?.order_invoice_number)
                ].filter(Boolean);

                const invoiceNumber = invoiceCandidates[0] || '';
                if (!invoiceNumber) {
                    return res.status(200).json({ success: true, msg: 'No invoice number found' });
                }

                const payment = await Payments.findOne({
                    paymentID: { $in: invoiceCandidates },
                    status: { $ne: 'paid' }
                }).sort({ createdAt: -1 });
                if (!payment) {
                    return res.status(200).json({ success: true, msg: 'Payment order not found or already paid' });
                }

                const transferAmount = parseAmount(payload?.transaction?.transaction_amount || payload?.order?.order_amount || 0);
                const orderTotal = Number(payment.total || 0);
                if (!Number.isFinite(transferAmount) || transferAmount < orderTotal) {
                    return res.status(200).json({ success: true, msg: 'Amount is less than order total' });
                }

                payment.status = 'paid';
                payment.gateway = normalizeCode(payload?.transaction?.payment_method || 'SEPAY_PG');
                payment.transferType = 'in';
                payment.transferAmount = transferAmount;
                payment.accountNumber = normalizeCode(payload?.transaction?.card_number);
                payment.transactionDate = normalizeCode(payload?.transaction?.transaction_date);
                payment.referenceCode = normalizeCode(payload?.transaction?.transaction_id || payload?.transaction?.id);
                payment.paidAt = new Date();
                payment.webhookRaw = payload;

                await payment.save();
                await fulfillPayment(payment);

                return res.status(200).json({ success: true });
            }

            const expectedApiKey = String(process.env.SEPAY_API_KEY || '').trim();
            const authorization = String(req.headers.authorization || '').trim();

            if (expectedApiKey) {
                const expectedAuth = `apikey ${expectedApiKey}`.toLowerCase();
                if (authorization.toLowerCase() !== expectedAuth) {
                    return res.status(401).json({ success: false, msg: 'Invalid SePay API key' });
                }
            }

            const transferType = normalizeCode(payload.transferType).toLowerCase();
            if (transferType !== 'in') {
                return res.status(200).json({ success: true, msg: 'Ignored non-incoming transaction' });
            }

            const paymentCode = extractPaymentCode(payload);
            if (!paymentCode) {
                return res.status(200).json({ success: true, msg: 'No payment code found' });
            }

            const payment = await Payments.findOne({ paymentCode, status: { $ne: 'paid' } }).sort({ createdAt: -1 });
            if (!payment) {
                return res.status(200).json({ success: true, msg: 'Payment order not found or already paid' });
            }

            const transferAmount = parseAmount(payload.transferAmount || 0);
            const orderTotal = Number(payment.total || 0);
            if (!Number.isFinite(transferAmount) || transferAmount < orderTotal) {
                return res.status(200).json({ success: true, msg: 'Amount is less than order total' });
            }

            const webhookTxId = Number(payload.id);
            if (Number.isFinite(webhookTxId) && Array.isArray(payment.sepayWebhookIds) && payment.sepayWebhookIds.includes(webhookTxId)) {
                return res.status(200).json({ success: true, msg: 'Duplicate webhook ignored' });
            }

            payment.status = 'paid';
            payment.gateway = normalizeCode(payload.gateway);
            payment.transferType = transferType;
            payment.transferAmount = transferAmount;
            payment.accountNumber = normalizeCode(payload.accountNumber);
            payment.transactionDate = normalizeCode(payload.transactionDate);
            payment.referenceCode = normalizeCode(payload.referenceCode);
            payment.sepayTransactionId = Number.isFinite(webhookTxId) ? webhookTxId : null;
            payment.paidAt = new Date();
            payment.webhookRaw = payload;

            if (Number.isFinite(webhookTxId)) {
                payment.sepayWebhookIds = Array.isArray(payment.sepayWebhookIds)
                    ? Array.from(new Set([...payment.sepayWebhookIds, webhookTxId]))
                    : [webhookTxId];
            }

            await payment.save();
            await fulfillPayment(payment);

            return res.status(201).json({ success: true });
        } catch (error) {
            return res.status(500).json({ success: false, msg: error.message });
        }
    }
};

module.exports = sepayCtrl;