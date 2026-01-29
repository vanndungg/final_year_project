const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    videoUrl: {
        type: String,
        required: true // Link video bài giảng (Youtube/Drive/Cloudinary)
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course', // Kết nối với Model Course
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Lesson', lessonSchema);