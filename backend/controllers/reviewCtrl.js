

const Reviews = require('../models/Review');
const Users = require('../models/User');

const reviewCtrl = {
// tao du lieu moi hoac bo sung du lieu.
    createReview: async (req, res) => {
        try {
            const { courseId, rating, comment } = req.body;
            const userId = req.user.id;

            // 1. Kiểm tra xem User đã mua khóa học này chưa
            const user = await Users.findById(userId);
            
            // Dùng .some() và ép kiểu về String để so sánh chính xác nhất
            const hasPurchased = user.enrolledCourses.some(id => id.toString() === courseId);
            
            if (!hasPurchased) {
                return res.status(400).json({ msg: "Bạn phải mua khóa học này trước khi đánh giá." });
            }

            // 2. Kiểm tra xem đã đánh giá chưa
            const alreadyReviewed = await Reviews.findOne({ courseId, userId });
            if (alreadyReviewed) {
                return res.status(400).json({ msg: "Bạn đã đánh giá khóa học này rồi." });
            }

            const newReview = new Reviews({
                courseId, userId, rating, comment
            });

            await newReview.save();
            res.json({ msg: "Cảm ơn bạn đã đánh giá!", newReview });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
// lay du lieu phuc vu API hoac giao dien.
    getCourseReviews: async (req, res) => {
        try {
            // req.params.id ở đây chính là Course ID
            const reviews = await Reviews.find({ courseId: req.params.id })
                .populate('userId', 'name') 
                .sort('-createdAt'); 
            
            res.json(reviews);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
};

module.exports = reviewCtrl;