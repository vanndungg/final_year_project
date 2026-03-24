const Lessons = require('../models/Lesson');
const Users = require('../models/User');
const Progress = require('../models/Progress');

const LESSON_TYPE_VALUES = new Set(['video', 'document', 'quiz', 'assignment']);
const LESSON_PUBLISH_VALUES = new Set(['draft', 'publish']);
const LESSON_ACCESS_VALUES = new Set(['all', 'premium']);

const normalizeText = (value) => String(value || '').trim();

const toNumber = (value, fallback = 0) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : fallback;
};

const toBoolean = (value, fallback = false) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (normalized === 'true') return true;
        if (normalized === 'false') return false;
    }
    if (typeof value === 'number') return value !== 0;
    return fallback;
};

const normalizeLessonType = (value) => {
    const normalized = String(value || '').trim().toLowerCase();
    return LESSON_TYPE_VALUES.has(normalized) ? normalized : 'video';
};

const buildYoutubeUrlFromVideoId = (videoId) => {
    const normalizedVideoId = normalizeText(videoId);
    return normalizedVideoId ? `https://www.youtube.com/watch?v=${normalizedVideoId}` : '';
};

const normalizePublishStatus = (value, fallback = 'draft') => {
    const normalized = String(value || '').trim().toLowerCase();
    if (normalized === 'published') return 'publish';
    if (LESSON_PUBLISH_VALUES.has(normalized)) return normalized;
    return fallback;
};

const normalizeAccessControl = (value, fallback = 'all') => {
    const normalized = String(value || '').trim().toLowerCase();
    if (LESSON_ACCESS_VALUES.has(normalized)) return normalized;
    return fallback;
};

const normalizeDateValue = (value) => {
    if (!value) return null;
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return null;
    return parsedDate;
};

const normalizeQuizQuestions = (quizQuestionsInput) => {
    if (!quizQuestionsInput) return [];

    const rawQuestions = Array.isArray(quizQuestionsInput)
        ? quizQuestionsInput
        : (() => {
            if (typeof quizQuestionsInput !== 'string') return [];

            try {
                const parsedValue = JSON.parse(quizQuestionsInput);
                return Array.isArray(parsedValue) ? parsedValue : [];
            } catch (error) {
                return [];
            }
        })();

    return rawQuestions
        .map((item) => {
            const question = normalizeText(item?.question);
            const options = Array.isArray(item?.options)
                ? item.options.map((option) => normalizeText(option)).filter(Boolean)
                : [];
            const correctOptionIndex = Math.max(0, Math.round(toNumber(item?.correctOptionIndex, 0)));

            if (!question) return null;

            return {
                question,
                options,
                correctOptionIndex: Math.min(correctOptionIndex, Math.max(0, options.length - 1))
            };
        })
        .filter(Boolean);
};

const normalizeLessonPayload = (rawPayload = {}, { requireCourseId = true } = {}) => {
    const title = normalizeText(rawPayload.title);
    const description = normalizeText(rawPayload.description);
    const lessonType = normalizeLessonType(rawPayload.lessonType);
    const courseId = normalizeText(rawPayload.courseId);
    const videoId = normalizeText(rawPayload.video_id);
    const videoUrl = normalizeText(rawPayload.videoUrl) || buildYoutubeUrlFromVideoId(videoId);
    const videoUploadData = normalizeText(rawPayload.videoUploadData);
    const videoUploadName = normalizeText(rawPayload.videoUploadName);
    const content = normalizeText(rawPayload.content);
    const durationMinutes = Math.max(0, Math.round(toNumber(rawPayload.durationMinutes, 0)));
    const quizQuestionCount = Math.max(0, Math.round(toNumber(rawPayload.quizQuestionCount, 0)));
    const hasOrder = rawPayload.order !== undefined && rawPayload.order !== null && String(rawPayload.order).trim() !== '';
    const order = hasOrder ? Math.max(1, Math.round(toNumber(rawPayload.order, 1))) : undefined;
    const thumbnail = normalizeText(rawPayload.thumbnail);
    const publishStatus = normalizePublishStatus(rawPayload.publishStatus || rawPayload.status, 'draft');
    const isPreview = toBoolean(rawPayload.isPreview, false);
    const isDownloadable = toBoolean(rawPayload.isDownloadable, false);
    const dripDays = Math.max(0, Math.round(toNumber(rawPayload.dripDays, 0)));
    const notifyOnPublish = toBoolean(rawPayload.notifyOnPublish, false);
    const requireCompletion = toBoolean(rawPayload.requireCompletion, false);
    const accessControl = normalizeAccessControl(rawPayload.accessControl, 'all');
    const resourceUrl = normalizeText(rawPayload.resourceUrl);
    const quizPassingScore = Math.max(0, Math.min(100, Math.round(toNumber(rawPayload.quizPassingScore, 0))));
    const quizTimeLimitMinutes = Math.max(0, Math.round(toNumber(rawPayload.quizTimeLimitMinutes, 0)));
    const quizAttemptsAllowed = Math.max(0, Math.round(toNumber(rawPayload.quizAttemptsAllowed, 0)));
    const assignmentMaxPoints = Math.max(0, Math.round(toNumber(rawPayload.assignmentMaxPoints, 100)));
    const assignmentDeadline = normalizeDateValue(rawPayload.assignmentDeadline);
    const allowLateSubmission = toBoolean(rawPayload.allowLateSubmission, false);
    const quizQuestions = normalizeQuizQuestions(rawPayload.quizQuestions);

    if (!title) {
        return { error: 'Vui lòng nhập tiêu đề bài học.' };
    }

    if (requireCourseId && !courseId) {
        return { error: 'Thiếu courseId để tạo bài học.' };
    }

    if (lessonType === 'video' && !videoId && !videoUrl && !videoUploadData) {
        return { error: 'Bài học dạng video cần Video ID, videoUrl hoặc file video.' };
    }

    if (lessonType === 'document' && !content && !resourceUrl) {
        return { error: 'Bài học dạng tài liệu cần file PDF hoặc nội dung tài liệu.' };
    }

    if (lessonType === 'quiz' && quizQuestions.length === 0 && quizQuestionCount <= 0) {
        return { error: 'Bài học dạng quiz cần ít nhất 1 câu hỏi.' };
    }

    if (lessonType === 'assignment' && !content) {
        return { error: 'Bài học dạng bài tập cần câu hỏi/yêu cầu.' };
    }

    const finalQuizQuestions = lessonType === 'quiz' ? quizQuestions : [];
    const finalQuizQuestionCount = lessonType === 'quiz'
        ? (finalQuizQuestions.length > 0 ? finalQuizQuestions.length : Math.max(1, quizQuestionCount))
        : 0;

    return {
        lessonPayload: {
            title,
            description,
            lessonType,
            courseId: requireCourseId ? courseId : undefined,
            video_id: videoId,
            videoUrl,
            videoUploadData,
            videoUploadName,
            content,
            durationMinutes,
            quizQuestionCount: finalQuizQuestionCount,
            quizQuestions: finalQuizQuestions,
            order,
            thumbnail,
            publishStatus,
            isPreview,
            isDownloadable,
            dripDays,
            notifyOnPublish,
            requireCompletion,
            accessControl,
            resourceUrl,
            quizPassingScore,
            quizTimeLimitMinutes,
            quizAttemptsAllowed,
            assignmentMaxPoints,
            assignmentDeadline,
            allowLateSubmission
        }
    };
};

const lessonCtrl = {
    // 1. Lấy danh sách bài học theo Khóa học (Dành cho học viên & Admin)
    getLessonsByCourse: async (req, res) => {
        try {
            const courseId = req.params.id;
            const lessons = await Lessons.find({ courseId }).sort({ order: 1, createdAt: 1 });

            let isEnrolled = false;
            let isAdmin = false;

            // Kiểm tra quyền: Đã đăng nhập chưa? Có phải Admin không? Đã mua khóa học chưa?
            if (req.user) {
                const user = await Users.findById(req.user.id).select('role enrolledCourses');
                // Admin (role 1) hoặc người đã mua (enrolledCourses)
                isAdmin = Number(user?.role) === 1;
                isEnrolled = isAdmin ||
                        user?.enrolledCourses?.some((enrolledCourseId) => String(enrolledCourseId) === String(courseId));
            }

            // Trả về dữ liệu an toàn (Ẩn nội dung lesson nếu người dùng chưa mua khóa học)
            const data = lessons.map((lesson, index) => {
                const publishStatus = normalizePublishStatus(lesson.publishStatus, 'draft');
                const isPublished = publishStatus === 'publish';

                if (!isAdmin && !isPublished) {
                    return null;
                }

                const previewVideoUrl = lesson.videoUrl || buildYoutubeUrlFromVideoId(lesson.video_id);
                const hasAccess = isAdmin || isEnrolled;

                return {
                    _id: lesson._id,
                    title: lesson.title,
                    description: lesson.description,
                    lessonType: lesson.lessonType || 'video',
                    order: lesson.order || index + 1,
                    durationMinutes: Number(lesson.durationMinutes || 0),
                    quizQuestionCount: Number(lesson.quizQuestionCount || 0),
                    publishStatus,
                    isPreview: Boolean(lesson.isPreview),
                    dripDays: Number(lesson.dripDays || 0),
                    video_id: hasAccess ? lesson.video_id : null,
                    videoUrl: hasAccess ? previewVideoUrl : null,
                    videoUploadData: hasAccess ? lesson.videoUploadData : null,
                    videoUploadName: hasAccess ? lesson.videoUploadName : null,
                    content: hasAccess ? lesson.content : null,
                    resourceUrl: hasAccess ? lesson.resourceUrl : null,
                    quizQuestions: hasAccess ? lesson.quizQuestions || [] : [],
                    isLocked: !hasAccess
                };
            }).filter(Boolean);

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
            const { lessonPayload, error } = normalizeLessonPayload(req.body, { requireCourseId: true });

            if (error) {
                return res.status(400).json({ msg: error });
            }

            const maxOrderLesson = await Lessons.findOne({ courseId: lessonPayload.courseId })
                .sort({ order: -1 })
                .select('order');

            const nextOrder = Number(maxOrderLesson?.order || 0) + 1;

            const newLesson = new Lessons({
                ...lessonPayload,
                order: lessonPayload.order || nextOrder
            });

            await newLesson.save();
            res.json({ msg: 'Đã thêm bài học thành công!', lesson: newLesson });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // 4. Cập nhật bài học (Sửa)
    updateLesson: async (req, res) => {
        try {
            const { lessonPayload, error } = normalizeLessonPayload(req.body, { requireCourseId: false });

            if (error) {
                return res.status(400).json({ msg: error });
            }

            const updatePayload = {
                title: lessonPayload.title,
                description: lessonPayload.description,
                lessonType: lessonPayload.lessonType,
                video_id: lessonPayload.video_id,
                videoUrl: lessonPayload.videoUrl,
                videoUploadData: lessonPayload.videoUploadData,
                videoUploadName: lessonPayload.videoUploadName,
                content: lessonPayload.content,
                durationMinutes: lessonPayload.durationMinutes,
                quizQuestionCount: lessonPayload.quizQuestionCount,
                quizQuestions: lessonPayload.quizQuestions,
                thumbnail: lessonPayload.thumbnail,
                publishStatus: lessonPayload.publishStatus,
                isPreview: lessonPayload.isPreview,
                isDownloadable: lessonPayload.isDownloadable,
                dripDays: lessonPayload.dripDays,
                notifyOnPublish: lessonPayload.notifyOnPublish,
                requireCompletion: lessonPayload.requireCompletion,
                accessControl: lessonPayload.accessControl,
                resourceUrl: lessonPayload.resourceUrl,
                quizPassingScore: lessonPayload.quizPassingScore,
                quizTimeLimitMinutes: lessonPayload.quizTimeLimitMinutes,
                quizAttemptsAllowed: lessonPayload.quizAttemptsAllowed,
                assignmentMaxPoints: lessonPayload.assignmentMaxPoints,
                assignmentDeadline: lessonPayload.assignmentDeadline,
                allowLateSubmission: lessonPayload.allowLateSubmission
            };

            if (lessonPayload.order !== undefined) {
                updatePayload.order = lessonPayload.order;
            }

            const updatedLesson = await Lessons.findOneAndUpdate(
                { _id: req.params.id },
                updatePayload,
                { new: true }
            );

            if (!updatedLesson) {
                return res.status(404).json({ msg: 'Bài học không tồn tại.' });
            }

            res.json({ msg: 'Cập nhật bài học thành công!', lesson: updatedLesson });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // 5. Xóa bài học
    deleteLesson: async (req, res) => {
        try {
            const deletedLesson = await Lessons.findByIdAndDelete(req.params.id);

            if (!deletedLesson) {
                return res.status(404).json({ msg: 'Bài học không tồn tại.' });
            }

            await Progress.updateMany(
                {},
                { $pull: { completedLessons: deletedLesson._id } }
            );

            res.json({ msg: 'Đã xóa bài học thành công!' });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
};

module.exports = lessonCtrl;