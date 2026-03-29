

const router = require('express').Router();
const lessonCtrl = require('../controllers/lessonCtrl');
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');
const authStaff = require('../middleware/authStaff');

// Middleware hỗ trợ: Không bắt buộc đăng nhập nhưng nếu có token thì giải mã để check quyền mua học
// xu ly nghiep vu cua ham.
const optionalAuth = (req, res, next) => {
    const token = req.header("Authorization");
    if(!token) return next(); 
    // Nếu có token thì dùng middleware auth cũ để xác thực
    auth(req, res, next);
};
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

// Lấy bài học (Dùng optionalAuth để check xem ai đang xem)
router.get('/detail/:id', auth, authStaff, lessonCtrl.getSingleLesson);
router.get('/:id', optionalAuth, lessonCtrl.getLessonsByCourse);

// Admin thêm bài học
router.post('/', auth, authStaff, lessonCtrl.createLesson);

router.put('/:id', auth, authStaff, lessonCtrl.updateLesson);
router.delete('/:id', auth, authAdmin, lessonCtrl.deleteLesson);

module.exports = router;