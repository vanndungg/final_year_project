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
            
            // Sử dụng $addToSet thay vì $push để tránh trùng lặp nếu bấm nhiều lần
            await Users.findOneAndUpdate({ _id: req.user.id }, {
                $addToSet: { enrolledCourses: { $each: newCourseIds } },
                $set: { cart: [] }
            });

            return res.json({ msg: "Thanh toán thành công!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // 5. Đăng ký nhanh (Dành cho nút bấm xác nhận/miễn phí)
    enrollCourse: async (req, res) => {
        try {
            console.log('[ENROLL API] userId:', req.user?.id, 'body:', req.body);

            const user = await Users.findById(req.user.id);
            if(!user) {
                console.log('[ENROLL API] missing user');
                return res.status(400).json({msg: "Người dùng không tồn tại."});
            }

            const { courseId } = req.body;
            if(!courseId) {
                console.log('[ENROLL API] missing courseId');
                return res.status(400).json({msg: "Thiếu ID khóa học."});
            }

            // Kiểm tra xem đã đăng ký chưa
            // Lưu ý: Dùng .toString() để so sánh chính xác các Object ID của MongoDB
            const isEnrolled = user.enrolledCourses.some(id => id.toString() === courseId);
            if(isEnrolled) {
                console.log('[ENROLL API] already enrolled');
                return res.status(400).json({msg: "Bạn đã sở hữu khóa học này."});
            }

            // Thêm vào danh sách
            await Users.findOneAndUpdate({_id: req.user.id}, {
                $push: { enrolledCourses: courseId }
            });

            // Tăng số lượng học viên cho khóa học
            await Courses.findOneAndUpdate({_id: courseId}, {
                $inc: { studentCount: 1 }
            });

            console.log('[ENROLL API] success');
            res.json({msg: "Đăng ký khóa học thành công!"});
        } catch (err) {
            console.error('[ENROLL API] error', err);
            return res.status(500).json({msg: err.message});
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