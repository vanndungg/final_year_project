const Users = require('../models/User');

const userCtrl = {
    // 1. Lấy thông tin cá nhân + các khóa học đã mua (Dùng để demo My Courses)
    getUser: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id)
                .select('-password')
                .populate('enrolledCourses'); // Tự động lấy chi tiết khóa học từ ID
            
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

            const { cart } = req.body; // Frontend gửi mảng cart mới lên

            await Users.findOneAndUpdate({ _id: req.user.id }, { cart });

            return res.json({ msg: "Đã thêm vào giỏ hàng thành công!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // 3. Thanh toán (Chuyển toàn bộ Giỏ hàng sang Enrolled Courses)
    // Đây là tính năng "ăn tiền" nhất khi demo
    checkout: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id);
            const cart = user.cart;

            if (cart.length === 0) return res.status(400).json({ msg: "Giỏ hàng rỗng, không thể thanh toán." });

            // Lấy danh sách ID khóa học từ giỏ hàng
            const newCourseIds = cart.map(item => item._id);

            // Cập nhật User: Push các ID mới vào enrolledCourses và Xóa sạch cart
            await Users.findOneAndUpdate({ _id: req.user.id }, {
                $push: { enrolledCourses: { $each: newCourseIds } },
                $set: { cart: [] }
            });

            return res.json({ msg: "Thanh toán thành công! Khóa học đã được thêm vào tài khoản của bạn." });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // 4. Đăng ký nhanh (Enroll trực tiếp không qua giỏ hàng)
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

    // 5. Lấy danh sách khóa học đã đăng ký
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