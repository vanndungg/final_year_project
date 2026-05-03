

const Users = require('../models/User');
// kiem tra quyen admin.
const authAdmin = async (req, res, next) => {
    try {
        const user = await Users.findOne({ _id: req.user.id });
        if (!user) return res.status(400).json({ msg: "User does not exist." });

        // Ép kiểu về Number để so sánh chuẩn xác nhất
        if (Number(user.role) !== 1) 
            return res.status(400).json({ msg: "Admin resource access denied." });

        next();
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

module.exports = authAdmin;