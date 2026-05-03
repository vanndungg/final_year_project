

const Users = require('../models/User');
// kiem tra quyen staff hoac admin.
const authStaff = async (req, res, next) => {
    try {
        const user = await Users.findOne({ _id: req.user.id }).select('role');
        if (!user) return res.status(400).json({ msg: 'User does not exist.' });

        const role = Number(user.role);
        if (role !== 1 && role !== 2) {
            return res.status(403).json({ msg: 'You do not have permission to access administrative resources.' });
        }

        next();
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
};

module.exports = authStaff;