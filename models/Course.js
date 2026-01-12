const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true }, // Link ảnh khóa học
    category: { type: String, required: true },
    teacher: { type: String, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Course', CourseSchema);