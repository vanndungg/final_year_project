const router = require('express').Router();
const userCtrl = require('../controllers/userCtrl');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /api/info:
 *   get:
 *     summary: Lấy thông tin tài khoản đang đăng nhập
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về thông tin user và danh sách khóa học đã mua
 */

/**
 * @swagger
 * /api/enroll:
 *   patch:
 *     summary: Đăng ký khóa học mới
 *     tags: [User]
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
 *                 example: "ID_KHOA_HOC_CUA_BAN"
 */

router.get('/info', auth, userCtrl.getUser);
router.patch('/enroll', auth, userCtrl.enrollCourse);

module.exports = router;