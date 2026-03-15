const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Vui lòng nhập tiêu đề bài học"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Vui lòng nhập mô tả bài học"]
    },
    // Trường dùng để lưu ID video (Ví dụ: YouTube ID như 'RGKi6LSPDLU')
    video_id: {
        type: String,
        required: [true, "Vui lòng cung cấp Video ID để hiển thị bài giảng"]
    },
    // videoUrl bây giờ sẽ không bắt buộc (required: false) 
    // để tránh lỗi khi bạn chỉ có video_id
    videoUrl: {
        type: String,
        required: false,
        default: ''
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Lesson', lessonSchema);