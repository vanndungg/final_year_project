const Progress = require('../models/Progress');
const Users = require('../models/User');
const Lessons = require('../models/Lesson');

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
    },

    submitAssignmentAnswer: async (req, res) => {
        try {
            const { courseId, lessonId, answer } = req.body;
            const userId = req.user.id;

            const normalizedAnswer = String(answer || '').trim();

            if (!courseId || !lessonId) {
                return res.status(400).json({ msg: 'Thiếu courseId hoặc lessonId.' });
            }

            if (!normalizedAnswer) {
                return res.status(400).json({ msg: 'Vui lòng nhập câu trả lời.' });
            }

            const [user, lesson] = await Promise.all([
                Users.findById(userId).select('role enrolledCourses'),
                Lessons.findById(lessonId).select('courseId lessonType title')
            ]);

            if (!lesson || String(lesson.courseId) !== String(courseId)) {
                return res.status(404).json({ msg: 'Lesson không tồn tại trong khóa học này.' });
            }

            if (lesson.lessonType !== 'assignment') {
                return res.status(400).json({ msg: 'Lesson này không phải dạng assignment.' });
            }

            const isAdmin = Number(user?.role) === 1;
            const isEnrolled = isAdmin || user?.enrolledCourses?.some((item) => String(item) === String(courseId));

            if (!isEnrolled) {
                return res.status(403).json({ msg: 'Bạn cần đăng ký khóa học trước khi nộp bài.' });
            }

            let progress = await Progress.findOne({ userId, courseId });
            if (!progress) {
                progress = new Progress({ userId, courseId, completedLessons: [], assignmentSubmissions: [] });
            }

            const existingSubmissionIndex = (progress.assignmentSubmissions || []).findIndex(
                (item) => String(item.lessonId) === String(lessonId)
            );

            const submissionPayload = {
                lessonId,
                answer: normalizedAnswer,
                submittedAt: new Date()
            };

            if (existingSubmissionIndex >= 0) {
                progress.assignmentSubmissions[existingSubmissionIndex] = submissionPayload;
            } else {
                progress.assignmentSubmissions.push(submissionPayload);
            }

            if (!progress.completedLessons.some((item) => String(item) === String(lessonId))) {
                progress.completedLessons.push(lessonId);
            }

            await progress.save();

            res.json({
                msg: 'Đã nộp câu trả lời assignment thành công.',
                submission: submissionPayload,
                lessonTitle: lesson.title
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
};

module.exports = progressCtrl;