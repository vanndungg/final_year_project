

const mongoose = require('mongoose');

// dinh nghia schema nguoi dung.
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
    // luu vai tro nguoi dung.
    role: { 
        type: Number,
        default: 0
    },
    // luu danh sach khoa hoc trong gio hang.
    cart: {
        type: Array,
        default: []
    },
    // luu danh sach khoa hoc da so huu.
    enrolledCourses: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Course' 
    }]
}, {
    timestamps: true
});

// tao model User.
module.exports = mongoose.model('User', UserSchema);