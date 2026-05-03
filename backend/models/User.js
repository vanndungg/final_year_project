

const mongoose = require('mongoose');

// dinh nghia schema nguoi dung.
const UserSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, "Please enter your name"], 
        trim: true 
    },
    email: { 
        type: String, 
        required: [true, "Please enter email"], 
        unique: true,
        lowercase: true
    },
    password: { 
        type: String, 
        required: [true, "Please enter password"] 
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