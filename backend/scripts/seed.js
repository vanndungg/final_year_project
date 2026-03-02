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

        // Xóa sạch dữ liệu cũ để tránh trùng lặp
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
            role: "user"
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

        // 3. TẠO BÀI HỌC MẪU CHO TẤT CẢ KHÓA HỌC
        const lessonData = [
            // Lessons cho ReactJS (Khóa 0)
            { title: "Giới thiệu React & JSX", description: "Hiểu về DOM ảo và cách React render", videoUrl: "https://www.youtube.com/watch?v=RGKi6LSPDLU", courseId: courses[0]._id },
            { title: "React Hooks căn bản", description: "Sử dụng useState & useEffect hiệu quả", videoUrl: "https://www.youtube.com/watch?v=TNhaISOUy6Q", courseId: courses[0]._id },
            { title: "Redux Toolkit", description: "Quản lý state toàn cục cho ứng dụng lớn", videoUrl: "https://www.youtube.com/watch?v=9boMnmzDx9Q", courseId: courses[0]._id },

            // Lessons cho NodeJS (Khóa 1)
            { title: "Kiến trúc NodeJS", description: "Event Loop và Non-blocking I/O", videoUrl: "https://www.youtube.com/watch?v=6m8SshXvW5E", courseId: courses[1]._id },
            { title: "Kết nối MongoDB", description: "Sử dụng Mongoose ODM", videoUrl: "https://www.youtube.com/watch?v=WDrU305J1yw", courseId: courses[1]._id },

            // Lessons cho UI/UX (Khóa 2)
            { title: "Làm quen với Figma", description: "Các công cụ vẽ vector cơ bản", videoUrl: "https://www.youtube.com/watch?v=c9Wg6ndoxpI", courseId: courses[2]._id },
            { title: "Nguyên lý màu sắc", description: "Cách phối màu trong thiết kế hiện đại", videoUrl: "https://www.youtube.com/watch?v=GyV_UG60dD4", courseId: courses[2]._id },

            // Lessons cho Python (Khóa 3)
            { title: "Python Syntax cơ bản", description: "Biến, vòng lặp và hàm", videoUrl: "https://www.youtube.com/watch?v=rfscVS0vtbw", courseId: courses[3]._id },
            { title: "Thư viện Pandas", description: "Xử lý bảng dữ liệu cực lớn", videoUrl: "https://www.youtube.com/watch?v=vmEHCJofslg", courseId: courses[3]._id },

            // Lessons cho Tiếng Anh (Khóa 4)
            { title: "Từ vựng chuyên ngành IT", description: "Các thuật ngữ hay dùng trong coding", videoUrl: "https://www.youtube.com/watch?v=5_f869n8GDM", courseId: courses[4]._id },
            { title: "Đọc hiểu Documentation", description: "Mẹo đọc tài liệu API nhanh chóng", videoUrl: "https://www.youtube.com/watch?v=7PInS-GIdH4", courseId: courses[4]._id }
        ];

        await Lesson.insertMany(lessonData);

        // 4. TẠO REVIEW MẪU
        await Review.insertMany([
            { courseId: courses[0]._id, userId: normalUser._id, rating: 5, comment: "Khóa học React chất lượng quá thầy ơi!" },
            { courseId: courses[1]._id, userId: normalUser._id, rating: 4, comment: "Backend dạy rất kỹ, mong thầy thêm phần Docker." }
        ]);

        // 5. CẬP NHẬT TRẠNG THÁI USER ĐỂ DEMO
        // Giả lập User này đã mua khóa ReactJS (khóa 0) để khi review bạn bấm vào xem được bài học ngay
        await User.findByIdAndUpdate(normalUser._id, {
            enrolledCourses: [courses[0]._id]
        });

        console.log("-----------------------------------------");
        console.log("✅ SEED DỮ LIỆU THÀNH CÔNG!");
        console.log(`👤 User: student@gmail.com / 123456 (Đã mua khóa ReactJS)`);
        console.log(`🔑 Admin: admin@gmail.com / 123456`);
        console.log("-----------------------------------------");
        
        process.exit();
    } catch (error) {
        console.error("❌ Lỗi thực thi seed:", error.message);
        process.exit(1);
    }
};

seedData();