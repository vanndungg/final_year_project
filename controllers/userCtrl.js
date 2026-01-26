const Users = require('../models/User');

const userCtrl = {
    // Lấy thông tin cá nhân + các khóa học đã mua
    getUser: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id).select('-password').populate('enrolledCourses');
            if (!user) return res.status(400).json({ msg: "Người dùng không tồn tại." });
            res.json(user);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    // Đăng ký khóa học
    enrollCourse: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id);
            const { courseId } = req.body;

            const isEnrolled = user.enrolledCourses.find(id => id.toString() === courseId);
            if (isEnrolled) return res.status(400).json({ msg: "Bạn đã đăng ký khóa học này rồi." });

            await Users.findOneAndUpdate({ _id: req.user.id }, {
                $push: { enrolledCourses: courseId }
            });

            return res.json({ msg: "Đăng ký khóa học thành công!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
};

module.exports = userCtrl;