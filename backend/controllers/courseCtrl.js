const Courses = require('../models/Course');
const Reviews = require('../models/Review');
const Users = require('../models/User');

const courseCtrl = {
    getCourses: async (req, res) => {
        try {
            const courses = await Courses.find().sort('-createdAt');

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

            // Lấy reviews và populate tên user để hiển thị ở Frontend
            const reviews = await Reviews.find({ courseId: course._id }).populate('userId', 'name avatar');
            
            const avgRating = reviews.length > 0 
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                : 0;

            res.json({
                ...course._doc,
                avgRating: Number(avgRating),
                totalReviews: reviews.length,
                reviews // Gửi kèm danh sách review về cho Detail Page
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    updateCourse: async (req, res) => {
        try {
            const { title, description, price, image, category, teacher } = req.body;
            
            // Tìm và cập nhật khóa học theo ID từ params
            const course = await Courses.findOneAndUpdate(
                { _id: req.params.id },
                { title, description, price, image, category, teacher },
                { new: true } // Trả về dữ liệu mới sau khi sửa
            );

            if (!course) return res.status(400).json({ msg: "Khóa học không tồn tại." });

            res.json({ msg: "Cập nhật khóa học thành công!", course });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    deleteCourse: async (req, res) => {
        try {
            await Courses.findByIdAndDelete(req.params.id);
            res.json({ msg: "Đã xóa khóa học thành công!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
};

module.exports = courseCtrl;