const Courses = require('../models/Course');
const Reviews = require('../models/Review'); // Thêm để tính rating
const Users = require('../models/User');     // Thêm để đếm học viên

const courseCtrl = {
    getCourses: async (req, res) => {
        try {
            // 1. Lấy danh sách khóa học gốc
            const courses = await Courses.find();
            
            // 2. Dùng Promise.all để xử lý song song các thống kê cho từng khóa học
            const coursesWithStats = await Promise.all(courses.map(async (course) => {
                
                // Đếm số lượng User đã đăng ký khóa học này
                const studentCount = await Users.countDocuments({ 
                    enrolledCourses: course._id 
                });

                // Lấy tất cả đánh giá của khóa học này
                const reviews = await Reviews.find({ courseId: course._id });
                
                // Tính điểm trung bình (ví dụ: 4.5)
                const avgRating = reviews.length > 0 
                    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                    : 0;

                // Trả về object mới gộp dữ liệu gốc + thống kê
                return {
                    ...course._doc,
                    studentCount,
                    avgRating: Number(avgRating),
                    totalReviews: reviews.length
                };
            }));

            res.json(coursesWithStats);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    createCourse: async (req, res) => {
        try {
            const { title, description, price, image, category, teacher } = req.body;

            // Kiểm tra xem tiêu đề đã tồn tại chưa (tránh tạo trùng)
            const course = await Courses.findOne({ title });
            if (course) return res.status(400).json({ msg: "Tên khóa học này đã tồn tại." });

            const newCourse = new Courses({
                title, description, price, image, category, teacher
            });

            await newCourse.save();
            res.json({ msg: "Đã tạo khóa học thành công!", course: newCourse });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // Thêm hàm lấy chi tiết 1 khóa học (rất cần cho trang Detail)
    getCourseDetail: async (req, res) => {
        try {
            const course = await Courses.findById(req.params.id);
            if (!course) return res.status(400).json({ msg: "Khóa học không tồn tại." });

            res.json(course);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
};

module.exports = courseCtrl;