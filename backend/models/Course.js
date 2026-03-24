const mongoose = require('mongoose');

const COURSE_STATUSES = ['draft', 'publish'];
const COURSE_PRICING_TYPES = ['paid', 'free'];
const COURSE_VISIBILITY_TYPES = ['public', 'private', 'unlisted'];
const COURSE_LEVEL_TYPES = ['beginner', 'intermediate', 'advanced', 'all-levels'];

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    image: { type: String, required: true }, // Link ảnh khóa học
    status: {
        type: String,
        enum: COURSE_STATUSES,
        default: 'draft'
    },
    pricingType: {
        type: String,
        enum: COURSE_PRICING_TYPES,
        default: 'paid'
    },
    price: {
        type: Number,
        min: 0,
        default: 0
    },
    currency: {
        type: String,
        default: 'VND',
        enum: ['VND']
    },
    teacher: {
        type: String,
        trim: true,
        default: 'EduLearn Team'
    },
    visibility: {
        type: String,
        enum: COURSE_VISIBILITY_TYPES,
        default: 'public'
    },
    level: {
        type: String,
        enum: COURSE_LEVEL_TYPES,
        default: 'all-levels'
    }
}, {
    timestamps: true
});

CourseSchema.pre('validate', function normalizePricing(next) {
    if (this.pricingType === 'free') {
        this.price = 0;
    }

    if (!Number.isFinite(Number(this.price)) || Number(this.price) < 0) {
        this.price = 0;
    }

    if (typeof next === 'function') {
        next();
    }
});

const CourseModel = mongoose.model('Course', CourseSchema);

module.exports = CourseModel;
module.exports.COURSE_STATUSES = COURSE_STATUSES;
module.exports.COURSE_PRICING_TYPES = COURSE_PRICING_TYPES;
module.exports.COURSE_VISIBILITY_TYPES = COURSE_VISIBILITY_TYPES;
module.exports.COURSE_LEVEL_TYPES = COURSE_LEVEL_TYPES;