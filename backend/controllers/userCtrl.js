const Users = require('../models/User');
const Courses = require('../models/Course');
const Payments = require('../models/Payment'); // Cần tạo model này
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
                cart: user.cart,
                subtotal: total,
                discount,
                couponCode,
                total: finalTotal
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
            await Users.findOneAndUpdate(
                { _id: req.params.id }, 
                { role: Number(role) }
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
    }
};

const createAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET || 'secret123', { expiresIn: '1d' });
};

module.exports = userCtrl;