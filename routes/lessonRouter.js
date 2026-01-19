const router = require('express').Router();
const lessonCtrl = require('../controllers/lessonCtrl');
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');

/**
 * @swagger
 * tags:
 * name: Lessons
 * description: Quản lý bài học bên trong khóa học
 */

/**
 * @swagger
 * /api/lessons:
 *   post:
 *     summary: Thêm bài học mới (Admin only)
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - videoUrl
 *               - courseId
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Bài 1: Giới thiệu về NodeJS"
 *               description:
 *                 type: string
 *                 example: "Tổng quan về môi trường chạy JavaScript"
 *               videoUrl:
 *                 type: string
 *                 example: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 *               courseId:
 *                 type: string
 *                 example: "65a1234567890abcdef12345"
 *     responses:
 *       200:
 *         description: Đã thêm bài học thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */

/**
 * @swagger
 * /api/lessons/{id}:
 *   get:
 *     summary: Lấy danh sách bài học của một khóa học cụ thể
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của khóa học (Course ID)
 *     responses:
 *       200:
 *         description: Danh sách bài học
 */

router.get('/:id', lessonCtrl.getLessonsByCourse);
router.post('/', auth, authAdmin, lessonCtrl.createLesson);

module.exports = router;