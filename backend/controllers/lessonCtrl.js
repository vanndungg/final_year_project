const Lessons = require('../models/Lesson');
const Users = require('../models/User');

const lessonCtrl = {
    // 1. Lấy danh sách bài học theo Khóa học (Dành cho học viên & Admin)
    getLessonsByCourse: async (req, res) => {
        try {
            const courseId = req.params.id;
            const lessons = await Lessons.find({ courseId }).sort({ createdAt: 1 });

            let isEnrolled = false;

            // Kiểm tra quyền: Đã đăng nhập chưa? Có phải Admin không? Đã mua khóa học chưa?
            if (req.user) {
                const user = await Users.findById(req.user.id);
                // Admin (role 1) hoặc người đã mua (enrolledCourses)
                isEnrolled = user.role === 1 || user.enrolledCourses.includes(courseId);
            }

            // Trả về dữ liệu an toàn (Chỉ hiện videoUrl/video_id nếu đã mua/là Admin)
            const data = lessons.map((lesson, index) => {
                return {
                    _id: lesson._id,
                    title: lesson.title,
                    description: lesson.description,
                    order: index + 1,
                    // Đồng nhất dùng video_id hoặc videoUrl tùy Model của bạn
                    video_id: isEnrolled ? (lesson.video_id || lesson.videoUrl) : null 
                };
            });

            res.json(data);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // 2. Lấy chi tiết 1 bài học (Dành cho trang Sửa - Edit Lesson)
    getSingleLesson: async (req, res) => {
        try {
            const lesson = await Lessons.findById(req.params.id);
            if (!lesson) return res.status(404).json({ msg: "Bài học không tồn tại." });
            res.json(lesson);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // 3. Thêm bài học mới
    createLesson: async (req, res) => {
        try {
            const { title, description, video_id, courseId } = req.body;
            
            // Kiểm tra link video không được trống
            if(!video_id) return res.status(400).json({msg: "Vui lòng cung cấp mã video YouTube."});

            const newLesson = new Lessons({ 
                title, 
                description, 
                video_id, // Đảm bảo trường này khớp với Model
                courseId 
            });

            await newLesson.save();
            res.json({ msg: "✅ Đã thêm bài học thành công!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // 4. Cập nhật bài học (Sửa)
    updateLesson: async (req, res) => {
        try {
            const { title, description, video_id } = req.body;
            
            await Lessons.findOneAndUpdate({ _id: req.params.id }, {
                title, 
                description, 
                video_id
            });

            res.json({ msg: "✅ Cập nhật bài học thành công!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // 5. Xóa bài học
    deleteLesson: async (req, res) => {
        try {
            await Lessons.findByIdAndDelete(req.params.id);
            res.json({ msg: "🗑️ Đã xóa bài học thành công!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
};

module.exports = lessonCtrl;