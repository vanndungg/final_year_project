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
            const lessons = await Lessons.find({ courseId });

            // Mặc định là khách (chưa mua)
            let isEnrolled = false;

            // Nếu người dùng đã đăng nhập, kiểm tra xem họ đã mua khóa học này chưa
            if (req.user) {
                const user = await Users.findById(req.user.id);
                isEnrolled = user.enrolledCourses.includes(courseId) || user.role === 'admin';
            }

            // Xử lý dữ liệu trả về
            const data = lessons.map(lesson => {
                return {
                    _id: lesson._id,
                    title: lesson.title,
                    description: lesson.description,
                    courseId: lesson.courseId,
                    // Nếu đã mua hoặc là Admin thì hiện link thật, nếu chưa thì ẩn đi
                    videoUrl: isEnrolled ? lesson.videoUrl : "🔒 Vui lòng đăng ký khóa học để xem video bài giảng"
                };
            });

            res.json(data);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
};

module.exports = lessonCtrl;