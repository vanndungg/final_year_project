const mongoose = require('mongoose');
require('dotenv').config();
const Course = require('../models/courseModel'); // <-- Kiểm tra tên model của bạn

const sampleData = [
    { title: "NodeJS cơ bản", description: "Học Backend với Express", price: 200000, image: "link_anh", category: "Web", teacher: "Dũng Admin" },
    { title: "ReactJS thực chiến", description: "Xây dựng giao diện hiện đại", price: 300000, image: "link_anh", category: "Web", teacher: "Dũng Admin" }
];

mongoose.connect(process.env.MONGODB_URL)
    .then(async () => {
        console.log("🚀 Đang nạp dữ liệu mẫu...");
        await Course.insertMany(sampleData);
        console.log("✅ Thành công! Thầy giáo có thể kiểm tra DB ngay.");
        process.exit();
    })
    .catch(err => console.log(err));