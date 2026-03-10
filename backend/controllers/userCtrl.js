const Users = require('../models/User');
const Courses = require('../models/Course');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userCtrl = {
    // 1. Đăng ký tài khoản
    register: async (req, res) => {
        try {
            const { name, email, password } = req.body;

            const user = await Users.findOne({ email });
            if (user) return res.status(400).json({ msg: "Email này đã được đăng ký." });

            if (password.length < 6)
                return res.status(400).json({ msg: "Mật khẩu phải có ít nhất 6 ký tự." });

            // Mã hóa mật khẩu
            const passwordHash = await bcrypt.hash(password, 10);
            const newUser = new Users({
                name, email, password: passwordHash, role: 0 // Mặc định là học viên (0)
            });

            // Lưu vào MongoDB
            await newUser.save();

            // Tạo token để đăng nhập ngay sau khi đăng ký
            const access_token = createAccessToken({ id: newUser._id });

            res.json({
                msg: "Đăng ký thành công!",
                access_token,
                user: {
                    ...newUser._doc,
                    password: ''
                }
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

            // Tạo Access Token
            const access_token = createAccessToken({ id: user._id });

            res.json({
                msg: "Đăng nhập thành công!",
                access_token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role // Trả về 0 hoặc 1
                }
            });

        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // 3. Đăng xuất (Chủ yếu xử lý ở Client bằng cách xóa Token, ở đây trả về thông báo)
    logout: async (req, res) => {
        try {
            return res.json({ msg: "Đã đăng xuất." });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // 4. Lấy thông tin cá nhân (Profile)
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

    // 6. Thanh toán
    checkout: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id);
            if (!user || user.cart.length === 0) 
                return res.status(400).json({ msg: "Giỏ hàng rỗng." });

            const newCourseIds = user.cart.map(item => item._id);
            
            await Users.findOneAndUpdate({ _id: req.user.id }, {
                $addToSet: { enrolledCourses: { $each: newCourseIds } },
                $set: { cart: [] }
            });

            return res.json({ msg: "Thanh toán thành công!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // 7. Đăng ký khóa học nhanh
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
            // Ép kiểu Number để chắc chắn lưu vào DB là số (0 hoặc 1)
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
    }
};

// Hàm bổ trợ tạo JWT
const createAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET || 'secret123', { expiresIn: '1d' });
};

module.exports = userCtrl;