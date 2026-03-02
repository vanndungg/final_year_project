const Lessons = require('../models/Lesson');
const Users = require('../models/User');

const lessonCtrl = {
    createLesson: async (req, res) => {
        try {
            const { title, description, videoUrl, courseId } = req.body;
            const newLesson = new Lessons({ title, description, videoUrl, courseId });
            await newLesson.save();
            res.json({ msg: "Đã thêm bài học thành công!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getLessonsByCourse: async (req, res) => {
    try {
        const courseId = req.params.id;
        const lessons = await Lessons.find({ courseId }).sort({ createdAt: 1 });

        let isEnrolled = false;

        // 1. Kiểm tra quyền sở hữu
        if (req.user) {
            const user = await Users.findById(req.user.id);
            // Check nếu đã mua khóa học HOẶC là Admin
            isEnrolled = user.enrolledCourses.includes(courseId) || user.role === 'admin';
        }

        // 2. Trả về dữ liệu đã được lọc (Bảo mật tuyệt đối từ Server)
        const data = lessons.map((lesson, index) => {
            return {
                _id: lesson._id,
                title: lesson.title,
                description: lesson.description,
                order: index + 1,
                // Nếu chưa mua, trả về null hoặc chuỗi thông báo thay vì link thật
                videoUrl: isEnrolled ? lesson.videoUrl : null 
            };
        });

        res.json(data);
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}
};

module.exports = lessonCtrl;