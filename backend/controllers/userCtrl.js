const Users = require('../models/User');
const Courses = require('../models/Course');

const userCtrl = {
    // 1. Lấy thông tin cá nhân + các khóa học đã mua
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

    // 2. Thêm khóa học vào Giỏ hàng
    addCart: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id);
            if (!user) return res.status(400).json({ msg: "Người dùng không tồn tại." });

            const { cart } = req.body;
            await Users.findOneAndUpdate({ _id: req.user.id }, { cart });

            return res.json({ msg: "Đã thêm vào giỏ hàng thành công!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // 3. Thanh toán (Chuyển giỏ hàng sang khóa học sở hữu)
    checkout: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id);
            const cart = user.cart;

            if (cart.length === 0) return res.status(400).json({ msg: "Giỏ hàng rỗng, không thể thanh toán." });

            const newCourseIds = cart.map(item => item._id);
            await Users.findOneAndUpdate({ _id: req.user.id }, {
                $push: { enrolledCourses: { $each: newCourseIds } },
                $set: { cart: [] }
            });

            return res.json({ msg: "Thanh toán thành công!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // 4. (Removed) legacy SePay helper was reverted

    // 5. Đăng ký nhanh (Dành cho khóa học MIỄN PHÍ)
    enrollCourse: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id);
            const { courseId } = req.body;

            const isEnrolled = user.enrolledCourses.find(id => id.toString() === courseId);
            if (isEnrolled) return res.status(400).json({ msg: "Bạn đã sở hữu khóa học này rồi." });

            await Users.findOneAndUpdate({ _id: req.user.id }, {
                $push: { enrolledCourses: courseId }
            });

            return res.json({ msg: "Đăng ký thành công!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // 6. Lấy danh sách khóa học đã đăng ký
    getEnrolledCourses: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id)
                .select('enrolledCourses')
                .populate('enrolledCourses');
            
            if (!user) return res.status(400).json({ msg: "Người dùng không tồn tại." });
            res.json(user.enrolledCourses);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
};

module.exports = userCtrl;