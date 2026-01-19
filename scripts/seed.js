const mongoose = require('mongoose');
require('dotenv').config();

// Sửa dòng này cho đúng với tên file Course.js trong ảnh của bạn
const Course = require('../models/Course'); 

const sampleData = [
    {
        title: "Khóa học NodeJS thực chiến",
        description: "Học làm backend từ cơ bản đến nâng cao",
        price: 500000,
        image: "https://vandung.com/node.png",
        category: "Backend",
        teacher: "Văn Dũng"
    }
];

mongoose.connect(process.env.MONGODB_URL)
    .then(async () => {
        console.log("🚀 Đang nạp dữ liệu Migration...");
        await Course.deleteMany({}); // Xóa dữ liệu cũ để tránh bị trùng
        await Course.insertMany(sampleData);
        console.log("✅ Migration thành công! Dữ liệu mẫu đã sẵn sàng.");
        process.exit();
    })
    .catch(err => {
        console.error("❌ Lỗi Migration:", err);
        process.exit(1);
    });