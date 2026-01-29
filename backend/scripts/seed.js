const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Course = require('../models/Course');
const User = require('../models/User');
const Lesson = require('../models/Lesson');
const Review = require('../models/Review');

const seedData = async () => {
    try {
        const URI = process.env.MONGODB_URL;
        if (!URI) throw new Error("Không tìm thấy MONGODB_URL trong file .env");

        await mongoose.connect(URI);
        console.log("🚀 Đã kết nối MongoDB. Đang dọn dẹp dữ liệu cũ...");

        // Xóa sạch dữ liệu cũ
        await User.deleteMany();
        await Course.deleteMany();
        await Lesson.deleteMany();
        await Review.deleteMany();

        console.log("📝 Đang khởi tạo dữ liệu mới...");

        // 1. TẠO USER & ADMIN MẪU
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash('123456', salt);

        const adminUser = await User.create({
            name: "Văn Dũng Admin",
            email: "admin@gmail.com",
            password: hashPassword,
            role: "admin"
        });

        const normalUser = await User.create({
            name: "Nguyễn Học Viên",
            email: "student@gmail.com",
            password: hashPassword,
            role: "user",
            cart: [] // Sẽ cập nhật sau khi có khóa học
        });

        // 2. TẠO 5 KHÓA HỌC MẪU
        const courses = await Course.insertMany([
            {
                title: "Lập trình ReactJS thực chiến",
                description: "Làm chủ React Hook, Redux và xây dựng dự án E-commerce hoàn chỉnh.",
                price: 599000,
                image: "https://vungiaphuc.com/wp-content/uploads/2023/04/reactjs.jpg",
                category: "Web Development",
                teacher: "Văn Dũng Admin"
            },
            {
                title: "NodeJS Professional Backend",
                description: "Học Express, MongoDB, JWT và cách triển khai Microservices.",
                price: 799000,
                image: "https://miro.medium.com/v2/resize:fit:1200/1*u677H9_O673YidJ_HSlb9Q.png",
                category: "Backend",
                teacher: "Văn Dũng Admin"
            },
            {
                title: "UI/UX Design với Figma",
                description: "Từ tư duy thiết kế đến Prototype ứng dụng di động chuyên nghiệp.",
                price: 299000,
                image: "https://ict-imgs.fpt.ai/images-cms/img_1656042457635_6820c74b98.png",
                category: "Design",
                teacher: "Văn Dũng Admin"
            },
            {
                title: "Python for Data Science",
                description: "Sử dụng Pandas, Numpy và Matplotlib để phân tích dữ liệu chuyên sâu.",
                price: 850000,
                image: "https://nndesign.vn/wp-content/uploads/2022/02/khoa-hoc-python-cho-nguoi-moi-bat-dau.jpg",
                category: "Data Science",
                teacher: "Văn Dũng Admin"
            },
            {
                title: "Tiếng Anh cho lập trình viên",
                description: "Cải thiện khả năng đọc tài liệu và giao tiếp trong môi trường IT.",
                price: 450000,
                image: "https://topicanative.edu.vn/wp-content/uploads/2020/08/tieng-anh-cho-lap-trinh-vien.jpg",
                category: "Soft Skills",
                teacher: "Văn Dũng Admin"
            }
        ]);

        // 3. TẠO BÀI HỌC MẪU (Cho khóa ReactJS và NodeJS)
        await Lesson.insertMany([
            { title: "Giới thiệu React & JSX", description: "Hiểu về DOM ảo", videoUrl: "https://www.youtube.com/watch?v=RGKi6LSPDLU", courseId: courses[0]._id },
            { title: "React Hooks căn bản", description: "useState & useEffect", videoUrl: "https://www.youtube.com/watch?v=TNhaISOUy6Q", courseId: courses[0]._id },
            { title: "Kiến trúc NodeJS", description: "Event Loop là gì?", videoUrl: "https://www.youtube.com/watch?v=6m8SshXvW5E", courseId: courses[1]._id }
        ]);

        // 4. TẠO REVIEW MẪU
        await Review.insertMany([
            { courseId: courses[0]._id, userId: normalUser._id, rating: 5, comment: "Khóa học chất lượng quá thầy ơi!" },
            { courseId: courses[1]._id, userId: normalUser._id, rating: 4, comment: "Rất chi tiết nhưng cần thêm nhiều bài tập thực hành." }
        ]);

        // 5. CẬP NHẬT GIỎ HÀNG & KHÓA HỌC ĐÃ MUA CHO USER (Để demo)
        // User đã mua khóa 1, và đang để khóa 2 trong giỏ hàng
        await User.findByIdAndUpdate(normalUser._id, {
            enrolledCourses: [courses[0]._id],
            cart: [courses[1]] 
        });

        console.log("-----------------------------------------");
        console.log("✅ SEED DỮ LIỆU THÀNH CÔNG!");
        console.log(`👤 Tài khoản User: student@gmail.com / 123456`);
        console.log(`🔑 Tài khoản Admin: admin@gmail.com / 123456`);
        console.log("-----------------------------------------");
        
        process.exit();
    } catch (error) {
        console.error("❌ Lỗi thực thi seed:", error.message);
        process.exit(1);
    }
};

seedData();