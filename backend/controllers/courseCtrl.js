const Courses = require('../models/Course');
const Reviews = require('../models/Review');
const Users = require('../models/User');

const courseCtrl = {
    getCourses: async (req, res) => {
        try {
            // Lấy toàn bộ danh sách khóa học, sắp xếp cái mới nhất lên đầu
            const courses = await Courses.find().sort('-createdAt');

            // Tính toán thống kê cho từng khóa học
            const coursesWithStats = await Promise.all(courses.map(async (course) => {
                const studentCount = await Users.countDocuments({ enrolledCourses: course._id });
                const reviews = await Reviews.find({ courseId: course._id });
                const avgRating = reviews.length > 0 
                    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                    : 0;

                return {
                    ...course._doc,
                    studentCount,
                    avgRating: Number(avgRating),
                    totalReviews: reviews.length
                };
            }));

            res.json({
                status: 'success',
                result: courses.length,
                courses: coursesWithStats
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    createCourse: async (req, res) => {
        try {
            const { title, description, price, image, category, teacher } = req.body;
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

    getCourseDetail: async (req, res) => {
        try {
            const course = await Courses.findById(req.params.id);
            if (!course) return res.status(400).json({ msg: "Khóa học không tồn tại." });

            const reviews = await Reviews.find({ courseId: course._id });
            const avgRating = reviews.length > 0 
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                : 0;

            res.json({
                ...course._doc,
                avgRating: Number(avgRating),
                totalReviews: reviews.length
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
};

module.exports = courseCtrl;