

const Progress = require('../models/Progress');
const Users = require('../models/User');
const Lessons = require('../models/Lesson');
// tao du lieu phu tro cho luong xu ly.
const buildProgressPayload = async (progressDoc, courseId) => {
    const totalLessons = await Lessons.countDocuments({ courseId });
    const completedLessons = Array.isArray(progressDoc?.completedLessons)
        ? progressDoc.completedLessons.map((item) => String(item))
        : [];
    const assignmentSubmissions = Array.isArray(progressDoc?.assignmentSubmissions)
        ? progressDoc.assignmentSubmissions.map((item) => ({
            lessonId: String(item.lessonId),
            answer: item.answer,
            submittedAt: item.submittedAt
        }))
        : [];

    const completedCount = completedLessons.length;
    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return {
        completedLessons,
        assignmentSubmissions,
        completedCount,
        totalLessons,
        progressPercent
    };
};

const progressCtrl = {
    // Đánh dấu 1 bài học là đã hoàn thành
// cap nhat trang thai hoac du lieu hien co.
    markComplete: async (req, res) => {
        try {
            const { courseId, lessonId } = req.body;
            const userId = req.user.id;

            if (!courseId || !lessonId) {
                return res.status(400).json({ msg: 'Thiếu courseId hoặc lessonId.' });
            }

            const [user, lesson] = await Promise.all([
                Users.findById(userId).select('role enrolledCourses'),
                Lessons.findById(lessonId).select('courseId title lessonType')
            ]);

            if (!lesson || String(lesson.courseId) !== String(courseId)) {
                return res.status(404).json({ msg: 'Lesson không tồn tại trong khóa học này.' });
            }

            const isAdmin = Number(user?.role) === 1;
            const isEnrolled = isAdmin || user?.enrolledCourses?.some((item) => String(item) === String(courseId));

            if (!isEnrolled) {
                return res.status(403).json({ msg: 'Bạn cần sở hữu khóa học trước khi cập nhật tiến độ.' });
            }

            // Tìm bản ghi tiến độ, nếu chưa có thì tạo mới (upsert)
            let progress = await Progress.findOne({ userId, courseId });

            if (!progress) {
                progress = new Progress({ userId, courseId, completedLessons: [lessonId] });
            } else {
                // Nếu bài học chưa có trong danh sách hoàn thành thì mới thêm vào
                if (!progress.completedLessons.some((item) => String(item) === String(lessonId))) {
                    progress.completedLessons.push(lessonId);
                }
            }

            await progress.save();
            res.json({
                msg: 'Đã đánh dấu hoàn thành bài học!',
                lessonTitle: lesson.title,
                progress: await buildProgressPayload(progress, courseId)
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
// cap nhat trang thai hoac du lieu hien co.
    unmarkComplete: async (req, res) => {
        try {
            const { courseId, lessonId } = req.body;
            const userId = req.user.id;

            if (!courseId || !lessonId) {
                return res.status(400).json({ msg: 'Thiếu courseId hoặc lessonId.' });
            }

            const [user, lesson, progress] = await Promise.all([
                Users.findById(userId).select('role enrolledCourses'),
                Lessons.findById(lessonId).select('courseId title lessonType'),
                Progress.findOne({ userId, courseId })
            ]);

            if (!lesson || String(lesson.courseId) !== String(courseId)) {
                return res.status(404).json({ msg: 'Lesson không tồn tại trong khóa học này.' });
            }

            const isAdmin = Number(user?.role) === 1;
            const isEnrolled = isAdmin || user?.enrolledCourses?.some((item) => String(item) === String(courseId));

            if (!isEnrolled) {
                return res.status(403).json({ msg: 'Bạn cần sở hữu khóa học trước khi cập nhật tiến độ.' });
            }

            if (!progress) {
                return res.status(404).json({ msg: 'Chưa có tiến độ để hoàn tác.' });
            }

            progress.completedLessons = (progress.completedLessons || []).filter(
                (item) => String(item) !== String(lessonId)
            );

            await progress.save();

            return res.json({
                msg: 'Đã hoàn tác trạng thái hoàn thành bài học.',
                lessonTitle: lesson.title,
                progress: await buildProgressPayload(progress, courseId)
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // Lấy tiến độ học tập của 1 khóa học
// lay du lieu phuc vu API hoac giao dien.
    getProgress: async (req, res) => {
        try {
            const { courseId } = req.params;
            const progress = await Progress.findOne({ userId: req.user.id, courseId });

            if (!progress) {
                return res.json(await buildProgressPayload(null, courseId));
            }

            res.json(await buildProgressPayload(progress, courseId));
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
// xu ly nghiep vu cua ham.
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
// xu ly nghiep vu cua ham.
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
                lessonTitle: lesson.title,
                progress: await buildProgressPayload(progress, courseId)
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
};

module.exports = progressCtrl;