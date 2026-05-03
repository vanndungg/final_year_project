

const mongoose = require('mongoose');

const LESSON_TYPES = ['video', 'document', 'quiz', 'assignment'];
const LESSON_PUBLISH_STATUSES = ['draft', 'publish'];
const LESSON_ACCESS_CONTROL = ['all', 'premium'];

const quizQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    options: [{
        type: String,
        trim: true
    }],
    correctOptionIndex: {
        type: Number,
        min: 0,
        default: 0
    }
}, { _id: false });

// dinh nghia schema bai hoc.
const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please enter lesson title"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Please enter lesson description"]
    },
    lessonType: {
        type: String,
        enum: LESSON_TYPES,
        default: 'video',
        required: true
    },
    video_id: {
        type: String,
        required: false,
        default: ''
    },
    videoUrl: {
        type: String,
        required: false,
        default: ''
    },
    videoUploadData: {
        type: String,
        default: ''
    },
    videoUploadName: {
        type: String,
        default: ''
    },
    content: {
        type: String,
        default: ''
    },
    durationMinutes: {
        type: Number,
        min: 0,
        default: 0
    },
    quizQuestionCount: {
        type: Number,
        min: 0,
        default: 0
    },
    quizQuestions: {
        type: [quizQuestionSchema],
        default: []
    },
    order: {
        type: Number,
        min: 1,
        default: 1
    },
    thumbnail: {
        type: String,
        default: ''
    },
    publishStatus: {
        type: String,
        enum: LESSON_PUBLISH_STATUSES,
        default: 'draft'
    },
    isPreview: {
        type: Boolean,
        default: false
    },
    isDownloadable: {
        type: Boolean,
        default: false
    },
    dripDays: {
        type: Number,
        min: 0,
        default: 0
    },
    notifyOnPublish: {
        type: Boolean,
        default: false
    },
    requireCompletion: {
        type: Boolean,
        default: false
    },
    accessControl: {
        type: String,
        enum: LESSON_ACCESS_CONTROL,
        default: 'all'
    },
    resourceUrl: {
        type: String,
        default: ''
    },
    quizPassingScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    quizTimeLimitMinutes: {
        type: Number,
        min: 0,
        default: 0
    },
    quizAttemptsAllowed: {
        type: Number,
        min: 0,
        default: 1
    },
    assignmentMaxPoints: {
        type: Number,
        min: 0,
        default: 100
    },
    assignmentDeadline: {
        type: Date,
        default: null
    },
    allowLateSubmission: {
        type: Boolean,
        default: false
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    }
}, {
    timestamps: true
});

lessonSchema.pre('validate', function normalizeLesson(next) {
    if (this.publishStatus === 'published') {
        this.publishStatus = 'publish';
    }

    if (this.lessonType === 'video' && !this.video_id && !this.videoUrl && !this.videoUploadData) {
        if (typeof next === 'function') {
            return next(new Error('Please provide Video ID, videoUrl or video file for video lesson.'));
        }
        throw new Error('Please provide Video ID, videoUrl or video file for video lesson.');
    }

    if (this.lessonType === 'document' && !String(this.content || '').trim() && !String(this.resourceUrl || '').trim()) {
        if (typeof next === 'function') {
            return next(new Error('Please upload PDF file or enter content for document lesson.'));
        }
        throw new Error('Please upload PDF file or enter content for document lesson.');
    }

    if (this.lessonType === 'assignment' && !String(this.content || '').trim()) {
        if (typeof next === 'function') {
            return next(new Error('Please enter content for document or assignment lesson.'));
        }
        throw new Error('Please enter content for document or assignment lesson.');
    }

    if (this.lessonType === 'quiz' && Number(this.quizQuestionCount || 0) <= 0) {
        this.quizQuestionCount = 5;
        this.quizPassingScore = Number(this.quizPassingScore || 0) > 0
            ? Number(this.quizPassingScore)
            : 80;
    }

    if (this.lessonType === 'quiz') {
        const normalizedQuestions = Array.isArray(this.quizQuestions)
            ? this.quizQuestions
                .map((item) => ({
                    question: String(item?.question || '').trim(),
                    options: Array.isArray(item?.options)
                        ? item.options.map((opt) => String(opt || '').trim()).filter(Boolean)
                        : [],
                    correctOptionIndex: Number.isFinite(Number(item?.correctOptionIndex))
                        ? Math.max(0, Math.round(Number(item.correctOptionIndex)))
                        : 0
                }))
                .filter((item) => item.question)
            : [];

        this.quizQuestions = normalizedQuestions;

        if (this.quizQuestions.length > 0) {
            this.quizQuestionCount = this.quizQuestions.length;
        }
    }

    if (this.lessonType !== 'quiz') {
        this.quizQuestionCount = 0;
        this.quizQuestions = [];
        this.quizPassingScore = 0;
        this.quizTimeLimitMinutes = 0;
        this.quizAttemptsAllowed = 0;
    }

    if (this.lessonType !== 'assignment') {
        this.assignmentDeadline = null;
        this.allowLateSubmission = false;
    }

    if (!Number.isFinite(Number(this.dripDays)) || Number(this.dripDays) < 0) {
        this.dripDays = 0;
    }

    if (!Number.isFinite(Number(this.durationMinutes)) || Number(this.durationMinutes) < 0) {
        this.durationMinutes = 0;
    }

    if (!Number.isFinite(Number(this.order)) || Number(this.order) < 1) {
        this.order = 1;
    }

    if (typeof next === 'function') {
        next();
    }
});

// tao model Lesson.
const LessonModel = mongoose.model('Lesson', lessonSchema);

module.exports = LessonModel;
module.exports.LESSON_TYPES = LESSON_TYPES;
module.exports.LESSON_PUBLISH_STATUSES = LESSON_PUBLISH_STATUSES;
module.exports.LESSON_ACCESS_CONTROL = LESSON_ACCESS_CONTROL;