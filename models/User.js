const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        default: 'user' // Có thể là 'admin'
    },
    enrolledCourses: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Course' 
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);