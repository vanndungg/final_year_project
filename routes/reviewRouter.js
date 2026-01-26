const router = require('express').Router();
const reviewCtrl = require('../controllers/reviewCtrl');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Gửi đánh giá cho khóa học (Chỉ người đã mua)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseId:
 *                 type: string
 *               rating:
 *                 type: number
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: "Khóa học rất hay và bổ ích!"
 */
router.post('/reviews', auth, reviewCtrl.createReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   get:
 *     summary: Lấy danh sách đánh giá của một khóa học
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/reviews/:id', reviewCtrl.getCourseReviews);

module.exports = router;