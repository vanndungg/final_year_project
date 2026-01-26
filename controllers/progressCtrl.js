const Progress = require('../models/Progress');

const progressCtrl = {
    // Đánh dấu 1 bài học là đã hoàn thành
    markComplete: async (req, res) => {
        try {
            const { courseId, lessonId } = req.body;
            const userId = req.user.id;

            // Tìm bản ghi tiến độ, nếu chưa có thì tạo mới (upsert)
            let progress = await Progress.findOne({ userId, courseId });

            if (!progress) {
                progress = new Progress({ userId, courseId, completedLessons: [lessonId] });
            } else {
                // Nếu bài học chưa có trong danh sách hoàn thành thì mới thêm vào
                if (!progress.completedLessons.includes(lessonId)) {
                    progress.completedLessons.push(lessonId);
                }
            }

            await progress.save();
            res.json({ msg: "Đã đánh dấu hoàn thành bài học!", progress });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // Lấy tiến độ học tập của 1 khóa học
    getProgress: async (req, res) => {
        try {
            const { courseId } = req.params;
            const progress = await Progress.findOne({ userId: req.user.id, courseId });
            
            res.json(progress ? progress : { completedLessons: [] });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
};

module.exports = progressCtrl;