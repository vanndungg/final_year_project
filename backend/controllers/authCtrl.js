const Users = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authCtrl = {
    register: async (req, res) => {
        try {
            const { name, email, password } = req.body;

            // 1. Kiểm tra xem người dùng đã tồn tại chưa
            const user = await Users.findOne({ email });
            if (user) return res.status(400).json({ msg: "Email này đã tồn tại." });

            // 2. Kiểm tra độ dài mật khẩu
            if (password.length < 6)
                return res.status(400).json({ msg: "Mật khẩu phải có ít nhất 6 ký tự." });

            // 3. Mã hóa mật khẩu
            const passwordHash = await bcrypt.hash(password, 10);

            // 4. Tạo đối tượng người dùng mới
            const newUser = new Users({
                name, email, password: passwordHash
            });

            // 5. Lưu vào MongoDB
            await newUser.save();

            res.json({ msg: "Đăng ký thành công!" });

        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await Users.findOne({ email });
            if (!user) return res.status(400).json({ msg: "Người dùng không tồn tại." });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ msg: "Mật khẩu không đúng." });

            // Tạo Token (Cần ACCESS_TOKEN_SECRET trong file .env)
            const access_token = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET || 'secret123', { expiresIn: '1d' });

            res.json({
                msg: "Đăng nhập thành công!",
                access_token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
};

module.exports = authCtrl;