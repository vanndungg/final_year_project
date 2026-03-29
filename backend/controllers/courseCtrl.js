const Courses = require('../models/Course');
const Reviews = require('../models/Review');
const Users = require('../models/User');
const Lessons = require('../models/Lesson');
const Progress = require('../models/Progress');

const COURSE_STATUS_VALUES = new Set(['draft', 'publish']);
const COURSE_PRICING_VALUES = new Set(['paid', 'free']);
const LESSON_TYPE_VALUES = new Set(['video', 'document', 'quiz', 'assignment']);
const COURSE_VISIBILITY_VALUES = new Set(['public', 'private', 'unlisted']);
const COURSE_LEVEL_VALUES = new Set(['beginner', 'intermediate', 'advanced', 'all-levels']);

const normalizeText = (value) => String(value || '').trim();

const toNumber = (value, fallback = 0) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : fallback;
};

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeStatus = (value, fallback = 'draft') => {
    const normalized = String(value || '').trim().toLowerCase();
    if (normalized === 'published') return 'publish';
    if (COURSE_STATUS_VALUES.has(normalized)) return normalized;
    return fallback;
};

const normalizePricingType = (value, priceValue) => {
    const normalized = String(value || '').trim().toLowerCase();
    if (COURSE_PRICING_VALUES.has(normalized)) return normalized;
    return Number(priceValue || 0) > 0 ? 'paid' : 'free';
};

const normalizeLessonType = (value) => {
    const normalized = String(value || '').trim().toLowerCase();
    return LESSON_TYPE_VALUES.has(normalized) ? normalized : 'video';
};

const normalizeVisibility = (value) => {
    const normalized = String(value || '').trim().toLowerCase();
    return COURSE_VISIBILITY_VALUES.has(normalized) ? normalized : 'public';
};

const normalizeLevel = (value) => {
    const normalized = String(value || '').trim().toLowerCase();
    return COURSE_LEVEL_VALUES.has(normalized) ? normalized : 'all-levels';
};

const buildYoutubeUrlFromVideoId = (videoId) => {
    const normalizedVideoId = normalizeText(videoId);
    return normalizedVideoId ? `https://www.youtube.com/watch?v=${normalizedVideoId}` : '';
};

const parseLessonsInput = (lessonsInput) => {
    if (lessonsInput === undefined) return undefined;
    if (Array.isArray(lessonsInput)) return lessonsInput;

    if (typeof lessonsInput === 'string') {
        try {
            const parsedLessons = JSON.parse(lessonsInput);
            return Array.isArray(parsedLessons) ? parsedLessons : null;
        } catch (error) {
            return null;
        }
    }

    return null;
};

const normalizeLessonsPayload = (rawLessons) => {
    if (!Array.isArray(rawLessons)) {
        return { error: 'Danh sách lesson không hợp lệ.' };
    }

    const normalizedLessons = [];

    for (let index = 0; index < rawLessons.length; index += 1) {
        const rawLesson = rawLessons[index] || {};

        const title = normalizeText(rawLesson.title);
        const description = normalizeText(rawLesson.description);
        const lessonType = normalizeLessonType(rawLesson.lessonType);
        const videoId = normalizeText(rawLesson.video_id);
        const videoUrl = normalizeText(rawLesson.videoUrl) || buildYoutubeUrlFromVideoId(videoId);
        const content = normalizeText(rawLesson.content);
        const durationMinutes = Math.max(0, Math.round(toNumber(rawLesson.durationMinutes, 0)));
        const quizQuestionCount = Math.max(0, Math.round(toNumber(rawLesson.quizQuestionCount, 0)));

        if (!title) {
            return { error: `Lesson #${index + 1}: Vui lòng nhập tiêu đề bài học.` };
        }

        if (lessonType === 'video' && !videoId && !videoUrl) {
            return { error: `Lesson #${index + 1}: Bài học dạng video cần Video ID hoặc videoUrl.` };
        }

        if (lessonType === 'document' && !content) {
            return { error: `Lesson #${index + 1}: Bài học dạng tài liệu cần đường dẫn hoặc nội dung tài liệu.` };
        }

        if (lessonType === 'quiz' && quizQuestionCount <= 0) {
            return { error: `Lesson #${index + 1}: Bài học dạng quiz cần số lượng câu hỏi > 0.` };
        }

        if (lessonType === 'assignment' && !content) {
            return { error: `Lesson #${index + 1}: Bài học dạng bài tập cần nội dung yêu cầu.` };
        }

        normalizedLessons.push({
            _id: normalizeText(rawLesson._id),
            title,
            description,
            lessonType,
            video_id: videoId,
            videoUrl,
            content,
            durationMinutes,
            quizQuestionCount,
            order: index + 1
        });
    }

    return { lessons: normalizedLessons };
};

const normalizeCoursePayload = (rawPayload = {}) => {
    const title = normalizeText(rawPayload.title);
    const category = normalizeText(rawPayload.category);
    const description = normalizeText(rawPayload.description);
    const image = normalizeText(rawPayload.image?.url || rawPayload.image);

    const basePrice = Math.max(0, Math.round(toNumber(rawPayload.price, 0)));
    const pricingType = normalizePricingType(rawPayload.pricingType, basePrice);
    const price = pricingType === 'free' ? 0 : basePrice;

    if (!title) return { error: 'Vui lòng nhập tên khóa học.' };
    if (!category) return { error: 'Vui lòng chọn category.' };
    if (!description) return { error: 'Vui lòng nhập mô tả khóa học.' };
    if (!image) return { error: 'Vui lòng cung cấp ảnh đại diện khóa học.' };

    if (pricingType === 'paid' && price <= 0) {
        return { error: 'Khóa học trả phí cần giá lớn hơn 0 VND.' };
    }

    return {
        coursePayload: {
            title,
            category,
            description,
            image,
            status: normalizeStatus(rawPayload.status, 'draft'),
            pricingType,
            price,
            currency: 'VND',
            teacher: normalizeText(rawPayload.teacher) || 'EduLearn Team',
            visibility: normalizeVisibility(rawPayload.visibility),
            level: normalizeLevel(rawPayload.level)
        }
    };
};

const syncCourseLessons = async (courseId, normalizedLessons) => {
    const existingLessons = await Lessons.find({ courseId }).select('_id').lean();
    const existingLessonIdSet = new Set(existingLessons.map((lesson) => String(lesson._id)));
    const incomingExistingIds = new Set();

    const createPayloads = [];
    const updatePromises = [];

    normalizedLessons.forEach((lesson) => {
        const lessonPayload = {
            title: lesson.title,
            description: lesson.description,
            lessonType: lesson.lessonType,
            video_id: lesson.video_id,
            videoUrl: lesson.videoUrl,
            content: lesson.content,
            durationMinutes: lesson.durationMinutes,
            quizQuestionCount: lesson.quizQuestionCount,
            order: lesson.order,
            courseId
        };

        if (lesson._id && existingLessonIdSet.has(lesson._id)) {
            incomingExistingIds.add(lesson._id);
            updatePromises.push(
                Lessons.findByIdAndUpdate(lesson._id, lessonPayload, { new: true })
            );
            return;
        }

        createPayloads.push(lessonPayload);
    });

    if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
    }

    if (createPayloads.length > 0) {
        await Lessons.insertMany(createPayloads);
    }

    const removedLessonIds = [...existingLessonIdSet].filter((id) => !incomingExistingIds.has(id));

    if (removedLessonIds.length > 0) {
        await Lessons.deleteMany({ _id: { $in: removedLessonIds }, courseId });
        await Progress.updateMany(
            { courseId },
            { $pull: { completedLessons: { $in: removedLessonIds } } }
        );
    }
};

const courseCtrl = {
    getCourses: async (req, res) => {
        try {
            const courses = await Courses.find().sort('-createdAt');

            const coursesWithStats = await Promise.all(courses.map(async (course) => {
                const [studentCount, reviews, lessonCount] = await Promise.all([
                    Users.countDocuments({ enrolledCourses: course._id }),
                    Reviews.find({ courseId: course._id }),
                    Lessons.countDocuments({ courseId: course._id })
                ]);
                const avgRating = reviews.length > 0 
                    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                    : 0;

                return {
                    ...course._doc,
                    status: normalizeStatus(course.status, 'publish'),
                    pricingType: normalizePricingType(course.pricingType, course.price),
                    studentCount,
                    lessonCount,
                    avgRating: Number(avgRating),
                    totalReviews: reviews.length
                };
            }));

            res.json({
                status: 'success',
                result: courses.length,
                courses: coursesWithStats
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    createCourse: async (req, res) => {
        try {
            const { coursePayload, error } = normalizeCoursePayload(req.body);
            if (error) return res.status(400).json({ msg: error });

            const parsedLessons = parseLessonsInput(req.body.lessons);
            if (parsedLessons === null) {
                return res.status(400).json({ msg: 'Danh sách lesson không hợp lệ.' });
            }

            const normalizedLessonsResult = normalizeLessonsPayload(parsedLessons || []);
            if (normalizedLessonsResult.error) {
                return res.status(400).json({ msg: normalizedLessonsResult.error });
            }

            const duplicatedCourse = await Courses.findOne({
                title: { $regex: new RegExp(`^${escapeRegex(coursePayload.title)}$`, 'i') }
            });

            if (duplicatedCourse) {
                return res.status(400).json({ msg: 'Tên khóa học này đã tồn tại.' });
            }

            const newCourse = await Courses.create(coursePayload);

            if (normalizedLessonsResult.lessons.length > 0) {
                await syncCourseLessons(newCourse._id, normalizedLessonsResult.lessons);
            }

            const createdLessons = await Lessons.find({ courseId: newCourse._id }).sort({ order: 1, createdAt: 1 });

            res.json({
                msg: 'Đã tạo khóa học thành công!',
                course: newCourse,
                lessons: createdLessons
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getCourseDetail: async (req, res) => {
        try {
            const course = await Courses.findById(req.params.id);
            if (!course) return res.status(400).json({ msg: "Khóa học không tồn tại." });

            const [studentCount, lessonCount, reviews, lessons] = await Promise.all([
                Users.countDocuments({ enrolledCourses: course._id }),
                Lessons.countDocuments({ courseId: course._id }),
                Reviews.find({ courseId: course._id }).populate('userId', 'name avatar'),
                Lessons.find({ courseId: course._id }).sort({ order: 1, createdAt: 1 })
            ]);
            
            const avgRating = reviews.length > 0 
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                : 0;

            res.json({
                ...course._doc,
                status: normalizeStatus(course.status, 'publish'),
                pricingType: normalizePricingType(course.pricingType, course.price),
                studentCount,
                lessonCount,
                avgRating: Number(avgRating),
                totalReviews: reviews.length,
                lessons,
                reviews // Gửi kèm danh sách review về cho Detail Page
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getCourseStudentsProgress: async (req, res) => {
        try {
            const courseId = req.params.id;

            const course = await Courses.findById(courseId).select('_id title teacher').lean();
            if (!course) {
                return res.status(404).json({ msg: 'Khóa học không tồn tại.' });
            }

            const [totalLessons, students] = await Promise.all([
                Lessons.countDocuments({ courseId }),
                Users.find({ enrolledCourses: courseId })
                    .select('_id name email avatar role createdAt')
                    .sort({ createdAt: -1 })
                    .lean()
            ]);

            const studentIds = students.map((student) => student._id);
            const progressDocs = studentIds.length > 0
                ? await Progress.find({ courseId, userId: { $in: studentIds } })
                    .select('userId completedLessons updatedAt')
                    .lean()
                : [];

            const progressMap = new Map(
                progressDocs.map((doc) => [String(doc.userId), doc])
            );

            const studentProgress = students.map((student) => {
                const progressDoc = progressMap.get(String(student._id));
                const completedCount = Array.isArray(progressDoc?.completedLessons)
                    ? progressDoc.completedLessons.length
                    : 0;
                const progressPercent = totalLessons > 0
                    ? Math.round((completedCount / totalLessons) * 100)
                    : 0;

                return {
                    _id: student._id,
                    name: student.name || 'Học viên',
                    email: student.email || '',
                    avatar: student.avatar || '',
                    role: Number(student.role || 0),
                    completedCount,
                    totalLessons,
                    progressPercent,
                    lastProgressAt: progressDoc?.updatedAt || null,
                    joinedAt: student.createdAt || null
                };
            });

            return res.json({
                course,
                totalStudents: studentProgress.length,
                totalLessons,
                students: studentProgress
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    updateCourse: async (req, res) => {
        try {
            const { coursePayload, error } = normalizeCoursePayload(req.body);
            if (error) return res.status(400).json({ msg: error });

            const course = await Courses.findById(req.params.id);
            if (!course) return res.status(400).json({ msg: 'Khóa học không tồn tại.' });

            const duplicatedCourse = await Courses.findOne({
                _id: { $ne: req.params.id },
                title: { $regex: new RegExp(`^${escapeRegex(coursePayload.title)}$`, 'i') }
            });

            if (duplicatedCourse) {
                return res.status(400).json({ msg: 'Tên khóa học này đã tồn tại.' });
            }

            const hasLessonsField = Object.prototype.hasOwnProperty.call(req.body, 'lessons');

            if (hasLessonsField) {
                const parsedLessons = parseLessonsInput(req.body.lessons);
                if (parsedLessons === null) {
                    return res.status(400).json({ msg: 'Danh sách lesson không hợp lệ.' });
                }

                const normalizedLessonsResult = normalizeLessonsPayload(parsedLessons || []);
                if (normalizedLessonsResult.error) {
                    return res.status(400).json({ msg: normalizedLessonsResult.error });
                }

                await syncCourseLessons(req.params.id, normalizedLessonsResult.lessons);
            }

            const updatedCourse = await Courses.findByIdAndUpdate(
                req.params.id,
                coursePayload,
                { new: true }
            );

            const updatedLessons = await Lessons.find({ courseId: req.params.id }).sort({ order: 1, createdAt: 1 });

            res.json({
                msg: 'Cập nhật khóa học thành công!',
                course: updatedCourse,
                lessons: updatedLessons
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    deleteCourse: async (req, res) => {
        try {
            const deletedCourse = await Courses.findByIdAndDelete(req.params.id);

            if (!deletedCourse) {
                return res.status(400).json({ msg: 'Khóa học không tồn tại.' });
            }

            const lessons = await Lessons.find({ courseId: req.params.id }).select('_id').lean();
            const lessonIds = lessons.map((lesson) => lesson._id);

            await Promise.all([
                Lessons.deleteMany({ courseId: req.params.id }),
                Progress.deleteMany({ courseId: req.params.id }),
                Users.updateMany(
                    { enrolledCourses: req.params.id },
                    { $pull: { enrolledCourses: req.params.id } }
                )
            ]);

            if (lessonIds.length > 0) {
                await Progress.updateMany(
                    {},
                    { $pull: { completedLessons: { $in: lessonIds } } }
                );
            }

            res.json({ msg: 'Đã xóa khóa học thành công!' });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
};

module.exports = courseCtrl;