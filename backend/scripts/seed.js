const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Course = require('../models/Course');
const User = require('../models/User');
const Lesson = require('../models/Lesson');
const Review = require('../models/Review');
const Payment = require('../models/Payment');

const seedData = async () => {
    try {
        const URI = process.env.MONGODB_URL;
        await mongoose.connect(URI);
        console.log("🚀 Bắt đầu quá trình xây dựng hệ thống dữ liệu chuyên nghiệp...");

        // Xóa sạch dữ liệu cũ
        await Promise.all([
            User.deleteMany(),
            Course.deleteMany(),
            Lesson.deleteMany(),
            Review.deleteMany(),
            Payment.deleteMany()
        ]);

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash('123456', salt);

        // 1. TẠO ADMIN & 30 HỌC VIÊN THẬT (Tăng số lượng học viên để phân phối)
        console.log("👥 Đang tạo đội ngũ học viên...");
        await User.create({ name: "Văn Dũng Admin", email: "admin@gmail.com", password: hashPassword, role: 1 });
        
        const students = [];
        for (let i = 1; i <= 30; i++) {
            const student = await User.create({
                name: `Học viên ${i}`,
                email: `student${i}@gmail.com`,
                password: hashPassword,
                role: 0
            });
            students.push(student);
        }

        // 2. TẠO 50 KHÓA HỌC CHẤT LƯỢNG CAO
        console.log("📚 Đang thiết kế 50 khóa học...");
        const categories = ["Web Development", "Backend", "Design", "Data Science", "Mobile App"];
        const subjects = ["ReactJS Master", "NodeJS Expert", "Python Data", "Figma UI/UX", "Flutter Mobile", "Java Spring", "Next.js 14", "VueJS 3"];

        const createdCourses = [];
        for (let i = 1; i <= 50; i++) {
            const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
            const course = await Course.create({
                title: `${randomSubject} - Khóa học thực chiến #${i}`,
                description: `Đây là khóa học ${randomSubject} được thiết kế dành cho người mới bắt đầu đến nâng cao. Bao gồm dự án thực tế và hỗ trợ 24/7.`,
                price: Math.floor(Math.random() * (1200000 - 300000) + 300000),
                image: `https://picsum.photos/seed/edu${i}/600/400`,
                category: categories[Math.floor(Math.random() * categories.length)],
                teacher: "Văn Dũng Admin",
                studentCount: 0 // Sẽ được cập nhật chính xác qua Payment
            });
            createdCourses.push(course);
        }

        // 3. TẠO BÀI HỌC (Mỗi khóa có 6 bài học - Tổng 300 bài)
        console.log("📖 Đang soạn thảo bài giảng cho từng khóa...");
        const youtubeIds = ["RGKi6LSPDLU", "TNhaISOUy6Q", "9boMnmzDx9Q", "6m8SshXvW5E", "WDrU305J1yw", "rfscVS0vtbw"];
        
        const lessonsPromises = createdCourses.flatMap(course => {
            return [1, 2, 3, 4, 5, 6].map(j => ({
                title: `Chương ${j}: Kiến thức cốt lõi về ${course.title.split(' ')[0]}`,
                description: `Trong bài học này chúng ta sẽ tìm hiểu sâu về kỹ thuật và cách ứng dụng thực tế phần ${j}.`,
                video_id: youtubeIds[j - 1],
                courseId: course._id
            }));
        });
        await Lesson.insertMany(lessonsPromises);

        // 4. PHÂN PHỐI HỌC VIÊN & TẠO DOANH THU (Quan trọng nhất)
        console.log("💰 Đang phân phối học viên và tạo lịch sử thanh toán...");
        const now = new Date();

        for (const course of createdCourses) {
            // Mỗi khóa học sẽ có từ 8 đến 15 học viên ngẫu nhiên từ danh sách 30 người trên
            const numberOfStudentsForThisCourse = Math.floor(Math.random() * (15 - 8 + 1) + 8);
            
            // Xáo trộn danh sách học viên và lấy ra số lượng cần thiết
            const shuffledStudents = [...students].sort(() => 0.5 - Math.random());
            const selectedStudents = shuffledStudents.slice(0, numberOfStudentsForThisCourse);

            for (const student of selectedStudents) {
                // Tạo Payment (Doanh thu)
                const randomDay = Math.floor(Math.random() * now.getDate()) + 1;
                const orderDate = new Date(now.getFullYear(), now.getMonth(), randomDay);

                await Payment.create({
                    user_id: student._id,
                    name: student.name,
                    email: student.email,
                    paymentID: `PAY-${course._id.toString().slice(-4)}-${student._id.toString().slice(-4)}`,
                    cart: [course],
                    total: course.price,
                    createdAt: orderDate
                });

                // Cập nhật User (Quyền học tập)
                await User.findByIdAndUpdate(student._id, {
                    $addToSet: { enrolledCourses: course._id }
                });

                // Tăng studentCount thực tế cho Course
                await Course.findByIdAndUpdate(course._id, {
                    $inc: { studentCount: 1 }
                });
            }

            // 5. TẠO REVIEW (Mỗi khóa có 3-6 đánh giá)
            const numReviews = Math.floor(Math.random() * 4) + 3;
            const comments = [
                "Khóa học rất hay, giảng viên nhiệt tình!",
                "Kiến thức thực chiến, áp dụng được ngay vào công việc.",
                "Video chất lượng, bài giảng dễ hiểu.",
                "Hài lòng với số tiền bỏ ra.",
                "Khóa học này đỉnh thật sự, mọi người nên mua nhé."
            ];

            for (let k = 0; k < numReviews; k++) {
                await Review.create({
                    courseId: course._id,
                    userId: selectedStudents[k]._id,
                    rating: Math.random() > 0.2 ? 5 : 4, // 80% là 5 sao, 20% là 4 sao cho thực tế
                    comment: comments[Math.floor(Math.random() * comments.length)]
                });
            }
        }

        console.log("-----------------------------------------");
        console.log("✅ HỆ THỐNG ĐÃ SẴN SÀNG VỚI DỮ LIỆU THỰC!");
        console.log(`- 50 Khóa học (Mỗi khóa ~10-15 học viên thật)`);
        console.log(`- 300 Bài học (Mỗi khóa 6 bài giảng)`);
        console.log(`- ~500 Giao dịch thanh toán (Doanh thu cực khủng)`);
        console.log(`- ~200 Đánh giá chất lượng`);
        console.log("-----------------------------------------");
        process.exit();
    } catch (error) {
        console.error("❌ Lỗi thực thi seed:", error);
        process.exit(1);
    }
};

seedData();