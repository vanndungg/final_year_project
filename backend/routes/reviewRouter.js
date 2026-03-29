

const router = require('express').Router();
const reviewCtrl = require('../controllers/reviewCtrl');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Gửi đánh giá cho khóa học
 *     tags:
 *       - Reviews
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
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/', auth, reviewCtrl.createReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   get:
 *     summary: Lấy đánh giá của một khóa học (ID là Course ID)
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/:id', reviewCtrl.getCourseReviews);

module.exports = router;