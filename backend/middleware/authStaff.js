

const Users = require('../models/User');
// kiem tra quyen staff hoac admin.
const authStaff = async (req, res, next) => {
    try {
        const user = await Users.findOne({ _id: req.user.id }).select('role');
        if (!user) return res.status(400).json({ msg: 'Người dùng không tồn tại.' });

        const role = Number(user.role);
        if (role !== 1 && role !== 2) {
            return res.status(403).json({ msg: 'Bạn không có quyền truy cập tài nguyên quản trị.' });
        }

        next();
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
};

module.exports = authStaff;