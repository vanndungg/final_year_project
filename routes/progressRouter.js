const router = require('express').Router();
const progressCtrl = require('../controllers/progressCtrl');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /api/progress/mark-complete:
 *   post:
 *     summary: Đánh dấu hoàn thành một bài học
 *     tags: [Progress]
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
 *               lessonId:
 *                 type: string
 */
router.post('/progress/mark-complete', auth, progressCtrl.markComplete);

/**
 * @swagger
 * /api/progress/{courseId}:
 *   get:
 *     summary: Lấy tiến độ của một khóa học cụ thể
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/progress/:courseId', auth, progressCtrl.getProgress);

module.exports = router;