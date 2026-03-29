const Users = require('../models/User');
const Courses = require('../models/Course');
const Payments = require('../models/Payment'); // Cần tạo model này
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const buildCoursePerformanceMetrics = async () => {
    const [users, courses] = await Promise.all([
        Users.find().select('enrolledCourses').lean(),
        Courses.find().select('_id price').lean()
    ]);

    const studentsByCourse = {};
    users.forEach((user) => {
        const uniqueCourseIds = new Set((user.enrolledCourses || []).map((courseId) => String(courseId)));
        uniqueCourseIds.forEach((courseId) => {
            studentsByCourse[courseId] = (studentsByCourse[courseId] || 0) + 1;
        });
    });

    const revenueByCourse = {};
    let totalRevenue = 0;

    courses.forEach((course) => {
        const courseId = String(course._id);
        const studentCount = Number(studentsByCourse[courseId] || 0);
        const unitPrice = Number(course.price || 0);
        const courseRevenue = Number.isFinite(unitPrice) ? studentCount * unitPrice : 0;

        revenueByCourse[courseId] = courseRevenue;
        totalRevenue += courseRevenue;
    });

    return { studentsByCourse, revenueByCourse, totalRevenue };
};

const generatePaymentCode = () => {
    const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `EDU${Date.now().toString().slice(-8)}${randomPart}`;
};

const buildSortedQuery = (params) => {
    const sortedKeys = Object.keys(params).sort();
    return sortedKeys
        .map((key) => `${key}=${encodeURIComponent(String(params[key])).replace(/%20/g, '+')}`)
        .join('&');
};

const buildVnpayPaymentUrl = ({ payment, ipAddr, backendBaseUrl }) => {
    const tmnCode = String(process.env.VNP_TMNCODE || '').trim();
    const hashSecret = String(process.env.VNP_HASHSECRET || '').trim();
    const vnpUrl = String(process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html').trim();
    const resolvedBackendBaseUrl = String(
        backendBaseUrl || process.env.BACKEND_URL || 'http://localhost:5000'
    ).replace(/\/$/, '');

    if (!tmnCode || !hashSecret) {
        throw new Error('Thieu VNP_TMNCODE hoac VNP_HASHSECRET trong .env');
    }

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const createDate = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

    const expire = new Date(now.getTime() + 15 * 60 * 1000);
    const expireDate = `${expire.getFullYear()}${pad(expire.getMonth() + 1)}${pad(expire.getDate())}${pad(expire.getHours())}${pad(expire.getMinutes())}${pad(expire.getSeconds())}`;

    const returnUrl = `${resolvedBackendBaseUrl}/api/vnpay/return?paymentId=${payment._id}`;
    const amount = Math.round(Number(payment.total || 0) * 100);

    const vnpParams = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Amount: amount,
        vnp_CurrCode: 'VND',
        vnp_TxnRef: payment.paymentID,
        vnp_OrderInfo: `Thanh toan don hang ${payment.paymentID}`,
        vnp_OrderType: 'other',
        vnp_Locale: 'vn',
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr || '127.0.0.1',
        vnp_CreateDate: createDate,
        vnp_ExpireDate: expireDate
    };

    const signData = buildSortedQuery(vnpParams);
    const secureHash = crypto.createHmac('sha512', hashSecret).update(Buffer.from(signData, 'utf-8')).digest('hex');

    return `${vnpUrl}?${signData}&vnp_SecureHash=${secureHash}`;
};

const fulfillPaymentOrder = async (paymentDoc) => {
    if (!paymentDoc || paymentDoc.isFulfilled) return;

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

const userCtrl = {
    // 1. Đăng ký tài khoản
    register: async (req, res) => {
        try {
            const { name, email, password } = req.body;

            const user = await Users.findOne({ email });
            if (user) return res.status(400).json({ msg: "Email này đã được đăng ký." });

            if (password.length < 6)
                return res.status(400).json({ msg: "Mật khẩu phải có ít nhất 6 ký tự." });

            const passwordHash = await bcrypt.hash(password, 10);
            const newUser = new Users({
                name, email, password: passwordHash, role: 0
            });

            await newUser.save();

            const access_token = createAccessToken({ id: newUser._id });

            res.json({
                msg: "Đăng ký thành công!",
                access_token,
                user: { ...newUser._doc, password: '' }
            });

        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // 2. Đăng nhập
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await Users.findOne({ email });
            if (!user) return res.status(400).json({ msg: "Người dùng không tồn tại." });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ msg: "Mật khẩu không đúng." });

            const access_token = createAccessToken({ id: user._id });

            res.json({
                msg: "Đăng nhập thành công!",
                access_token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // 3. Đăng xuất
    logout: async (req, res) => {
        try {
            return res.json({ msg: "Đã đăng xuất." });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // 4. Lấy thông tin cá nhân
    getUser: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id)
                .select('-password')
                .populate('enrolledCourses');
            
            if (!user) return res.status(400).json({ msg: "Người dùng không tồn tại." });
            res.json(user);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    updateAvatar: async (req, res) => {
        try {
            const avatar = String(req.body?.avatar || '').trim();

            if (avatar && !/^data:image\//.test(avatar) && !/^https?:\/\//i.test(avatar)) {
                return res.status(400).json({ msg: 'Định dạng avatar không hợp lệ.' });
            }

            if (avatar.length > 4 * 1024 * 1024) {
                return res.status(400).json({ msg: 'Ảnh đại diện quá lớn.' });
            }

            const updatedUser = await Users.findByIdAndUpdate(
                req.user.id,
                { avatar },
                { new: true }
            )
                .select('-password')
                .populate('enrolledCourses');

            if (!updatedUser) {
                return res.status(404).json({ msg: 'Người dùng không tồn tại.' });
            }

            return res.json({
                msg: 'Cập nhật avatar thành công.',
                user: updatedUser
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // 5. Quản lý Giỏ hàng
    addCart: async (req, res) => {
        try {
            const { cart } = req.body;
            await Users.findOneAndUpdate({ _id: req.user.id }, { cart });

            return res.json({ msg: "Đã thêm vào giỏ hàng thành công!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // 6. Thanh toán (Đã bổ sung lưu Payment)
    checkout: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id);
            if (!user || user.cart.length === 0) 
                return res.status(400).json({ msg: "Giỏ hàng rỗng." });

            const newCourseIds = user.cart.map(item => item._id);
            
            // Tính tổng tiền từ giỏ hàng
            const total = user.cart.reduce((prev, item) => {
                return prev + (item.price || 0);
            }, 0);

            const couponCode = String(req.body?.couponCode || '').trim().toUpperCase();
            const discount = couponCode === 'EDU50' ? Math.min(50000, total) : 0;
            const finalTotal = Math.max(0, total - discount);

            // Lưu lịch sử giao dịch vào bảng Payments
            const newPayment = new Payments({
                user_id: user._id,
                name: user.name,
                email: user.email,
                paymentID: `PAY-${Date.now()}`, 
                paymentCode: `LEGACY-${Date.now()}`,
                cart: user.cart,
                subtotal: total,
                discount,
                couponCode,
                total: finalTotal,
                status: 'paid',
                paidAt: new Date(),
                isFulfilled: true
            });

            await newPayment.save();

            // Cập nhật User: Thêm khóa học và làm trống giỏ hàng
            await Users.findOneAndUpdate({ _id: req.user.id }, {
                $addToSet: { enrolledCourses: { $each: newCourseIds } },
                $set: { cart: [] }
            });

            // Tăng StudentCount cho từng khóa học
            for (const id of newCourseIds) {
                await Courses.findOneAndUpdate({ _id: id }, {
                    $inc: { studentCount: 1 }
                });
            }

            return res.json({
                msg: "Thanh toán thành công!",
                subtotal: total,
                discount,
                couponCode,
                total: finalTotal
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    createVnpayOrder: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id).select('name email cart enrolledCourses');
            if (!user) return res.status(400).json({ msg: 'Người dùng không tồn tại.' });

            const cartItems = Array.isArray(user.cart) ? user.cart : [];
            if (cartItems.length === 0) return res.status(400).json({ msg: 'Giỏ hàng rỗng.' });

            const enrolledIds = new Set((user.enrolledCourses || []).map((id) => String(id)));
            const payableItems = cartItems.filter((item) => !enrolledIds.has(String(item?._id || '')));
            if (payableItems.length === 0) {
                return res.status(400).json({ msg: 'Không có khóa học hợp lệ để thanh toán.' });
            }

            const subtotal = payableItems.reduce((sum, item) => sum + Number(item?.price || 0), 0);
            const couponCode = String(req.body?.couponCode || '').trim().toUpperCase();
            const discount = couponCode === 'EDU50' ? Math.min(50000, subtotal) : 0;
            const total = Math.max(0, subtotal - discount);

            const pendingOrder = await Payments.findOne({
                user_id: String(user._id),
                status: 'pending',
                isFulfilled: false,
                total
            }).sort({ createdAt: -1 });

            const order = pendingOrder || await Payments.create({
                user_id: user._id,
                name: user.name,
                email: user.email,
                paymentID: `SP-${Date.now()}`,
                paymentCode: generatePaymentCode(),
                cart: payableItems,
                subtotal,
                discount,
                couponCode,
                total,
                status: 'pending',
                isFulfilled: false
            });

            return res.json({
                msg: 'Đã tạo yêu cầu thanh toán VNPAY.',
                payment: {
                    _id: order._id,
                    paymentCode: order.paymentCode,
                    status: order.status,
                    subtotal: order.subtotal,
                    discount: order.discount,
                    total: order.total,
                    couponCode: order.couponCode,
                    createdAt: order.createdAt
                }
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getVnpayPaymentUrl: async (req, res) => {
        try {
            const payment = await Payments.findOne({
                _id: req.params.paymentId,
                user_id: String(req.user.id)
            });

            if (!payment) return res.status(404).json({ msg: 'Không tìm thấy giao dịch.' });
            if (String(payment.status).toLowerCase() === 'paid') {
                return res.status(400).json({ msg: 'Giao dịch đã thanh toán.' });
            }

            const ipAddr = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
                || req.connection?.remoteAddress
                || req.socket?.remoteAddress
                || '127.0.0.1';

            const backendBaseUrl = String(process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');

            const paymentUrl = buildVnpayPaymentUrl({
                payment,
                ipAddr: String(ipAddr).replace('::ffff:', ''),
                backendBaseUrl
            });

            return res.json({
                paymentId: payment._id,
                paymentInvoiceNumber: payment.paymentID,
                paymentUrl
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getVnpayPaymentStatus: async (req, res) => {
        try {
            const payment = await Payments.findOne({
                _id: req.params.paymentId,
                user_id: String(req.user.id)
            }).lean();

            if (!payment) return res.status(404).json({ msg: 'Không tìm thấy giao dịch.' });

            const cartItems = Array.isArray(payment.cart) ? payment.cart : [];
            const courseItems = cartItems.map((item) => ({
                _id: item?._id,
                title: item?.title || 'Khóa học',
                image: item?.image || '',
                price: Number(item?.price || 0),
                studentCount: Number(item?.studentCount || 0),
                rating: Number(item?.ratingsAverage || 5)
            }));

            return res.json({
                _id: payment._id,
                paymentCode: payment.paymentCode,
                status: payment.status,
                subtotal: Number(payment.subtotal || 0),
                discount: Number(payment.discount || 0),
                total: Number(payment.total || 0),
                couponCode: payment.couponCode || '',
                paidAt: payment.paidAt,
                createdAt: payment.createdAt,
                gateway: payment.gateway || '',
                transferAmount: Number(payment.transferAmount || 0),
                accountNumber: payment.accountNumber || '',
                referenceCode: payment.referenceCode || '',
                courseItems
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // Backward-compat aliases during payment gateway migration
    createSepayOrder: async (req, res) => userCtrl.createVnpayOrder(req, res),
    getSepayCheckoutForm: async (req, res) => userCtrl.getVnpayPaymentUrl(req, res),
    getSepayPaymentStatus: async (req, res) => userCtrl.getVnpayPaymentStatus(req, res),

    // 7. Đăng ký khóa học nhanh (Free hoặc Quick Enroll)
    enrollCourse: async (req, res) => {
        try {
            const { courseId } = req.body;
            const user = await Users.findById(req.user.id);

            const isEnrolled = user.enrolledCourses.some(id => id.toString() === courseId);
            if(isEnrolled) return res.status(400).json({msg: "Bạn đã sở hữu khóa học này."});

            await Users.findOneAndUpdate({_id: req.user.id}, {
                $push: { enrolledCourses: courseId }
            });

            await Courses.findOneAndUpdate({_id: courseId}, {
                $inc: { studentCount: 1 }
            });

            res.json({msg: "Đăng ký thành công!"});
        } catch (err) {
            return res.status(500).json({msg: err.message});
        }
    },

    // 8. Admin: Lấy danh sách tất cả người dùng
    getUsersAllInfor: async (req, res) => {
        try {
            const users = await Users.find().select('-password');
            res.json(users);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // 9. Admin: Cập nhật quyền (Role)
    updateRole: async (req, res) => {
        try {
            const { role } = req.body;
            const nextRole = Number(role);

            if (![0, 1, 2].includes(nextRole)) {
                return res.status(400).json({ msg: 'Role không hợp lệ. Chỉ chấp nhận 0, 1, 2.' });
            }

            await Users.findOneAndUpdate(
                { _id: req.params.id }, 
                { role: nextRole }
            );
            
            res.json({ msg: "Cập nhật quyền hạn thành công!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // 10. Lấy danh sách khóa học đã đăng ký
    getEnrolledCourses: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id).populate('enrolledCourses');
            if (!user) return res.status(400).json({ msg: "Người dùng không tồn tại." });
            res.json(user.enrolledCourses);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // 11. Admin: Thống kê Dashboard (Mới)
    getAdminStats: async (req, res) => {
        try {
            const [totalStudents, metrics] = await Promise.all([
                Users.countDocuments({ role: 0 }),
                buildCoursePerformanceMetrics()
            ]);

            res.json({
                students: totalStudents,
                revenue: metrics.totalRevenue
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // 12. Admin: Thong ke hoc vien/doanh thu theo tung khoa hoc
    getCoursePerformanceStats: async (req, res) => {
        try {
            const { studentsByCourse, revenueByCourse } = await buildCoursePerformanceMetrics();

            return res.json({ studentsByCourse, revenueByCourse });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // 13. Admin: Danh sach giao dich thanh cong
    getSuccessfulPayments: async (req, res) => {
        try {
            const payments = await Payments.find({ status: 'paid' })
                .sort({ paidAt: -1, updatedAt: -1 })
                .lean();

            const formatted = payments.map((payment) => {
                const cartItems = Array.isArray(payment.cart) ? payment.cart : [];
                const courseItems = cartItems.map((item) => ({
                    _id: item?._id,
                    title: item?.title || 'Khóa học'
                }));

                return {
                    _id: payment._id,
                    paymentID: payment.paymentID,
                    paymentCode: payment.paymentCode,
                    name: payment.name,
                    email: payment.email,
                    total: Number(payment.total || 0),
                    paidAt: payment.paidAt,
                    gateway: payment.gateway || 'N/A',
                    referenceCode: payment.referenceCode || '',
                    transferAmount: Number(payment.transferAmount || 0),
                    courseItems
                };
            });

            return res.json(formatted);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
};

const createAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET || 'secret123', { expiresIn: '1d' });
};

module.exports = userCtrl;