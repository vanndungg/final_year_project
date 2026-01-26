const Reviews = require('../models/Review');
const Users = require('../models/User');

const reviewCtrl = {
    createReview: async (req, res) => {
        try {
            const { courseId, rating, comment } = req.body;
            const userId = req.user.id;

            // 1. Kiểm tra xem User đã mua khóa học này chưa
            const user = await Users.findById(userId);
            if (!user.enrolledCourses.includes(courseId)) {
                return res.status(400).json({ msg: "Bạn phải mua khóa học này trước khi đánh giá." });
            }

            // 2. Kiểm tra xem đã đánh giá chưa (mỗi người chỉ đánh giá 1 lần)
            const alreadyReviewed = await Reviews.findOne({ courseId, userId });
            if (alreadyReviewed) {
                return res.status(400).json({ msg: "Bạn đã đánh giá khóa học này rồi." });
            }

            const newReview = new Reviews({
                courseId, userId, rating, comment
            });

            await newReview.save();
            res.json({ msg: "Cảm ơn bạn đã đánh giá!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getCourseReviews: async (req, res) => {
        try {
            const reviews = await Reviews.find({ courseId: req.params.id })
                .populate('userId', 'name') // Chỉ lấy tên người dùng để bảo mật email/pass
                .sort('-createdAt'); // Nhận xét mới nhất hiện lên đầu
            
            res.json(reviews);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
};

module.exports = reviewCtrl;