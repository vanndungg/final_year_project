const Users = require('../models/User');

const authAdmin = async (req, res, next) => {
    try {
        // Kiểm tra req.user có tồn tại không (đảm bảo middleware auth chạy trước)
        if (!req.user || !req.user.id) return res.status(400).json({ msg: "Xác thực không hợp lệ." });

        // Lấy thông tin người dùng từ ID đã giải mã ở middleware auth
        const user = await Users.findOne({ _id: req.user.id });
        if(!user) return res.status(400).json({ msg: "Người dùng không tồn tại." });
        if(user.role !== 'admin') 
            return res.status(400).json({msg: "Truy cập tài nguyên Admin bị từ chối."});

        next();
    } catch (err) {
        return res.status(500).json({msg: err.message});
    }
}

module.exports = authAdmin;