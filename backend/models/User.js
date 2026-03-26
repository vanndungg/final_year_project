const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, "Vui lòng nhập tên của bạn"], 
        trim: true 
    },
    email: { 
        type: String, 
        required: [true, "Vui lòng nhập email"], 
        unique: true,
        lowercase: true
    },
    password: { 
        type: String, 
        required: [true, "Vui lòng nhập mật khẩu"] 
    },
    avatar: {
        type: String,
        default: ''
    },
    role: { 
        type: Number, // ✅ Bắt buộc phải là Number
        default: 0
    },
    // 🛒 Giỏ hàng: Lưu các khóa học người dùng định mua nhưng chưa thanh toán
    cart: {
        type: Array,
        default: []
    },
    // 🎓 Khóa học đã sở hữu: Sau khi bấm "Thanh toán" hoặc "Enroll"
    enrolledCourses: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Course' 
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);