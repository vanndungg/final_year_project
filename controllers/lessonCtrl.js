const Lessons = require('../models/Lesson');

const lessonCtrl = {
    // Admin thêm bài học mới vào khóa học
    createLesson: async (req, res) => {
        try {
            const { title, description, videoUrl, courseId } = req.body;
            
            const newLesson = new Lessons({
                title, description, videoUrl, courseId
            });

            await newLesson.save();
            res.json({ msg: "Đã thêm bài học thành công!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    // Lấy tất cả bài học của một khóa học cụ thể
    getLessonsByCourse: async (req, res) => {
        try {
            const lessons = await Lessons.find({ courseId: req.params.id });
            res.json(lessons);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
};

module.exports = lessonCtrl;