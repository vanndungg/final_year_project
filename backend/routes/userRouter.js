const router = require('express').Router();
const userCtrl = require('../controllers/userCtrl');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /api/users/enroll:
 *   patch:
 *     summary: Đăng ký khóa học mới
 *     tags: [Enrollment]
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
 *     responses:
 *       200:
 *         description: Đăng ký thành công
 * /api/users/enrolled_courses:
 *   get:
 *     summary: Lấy danh sách khóa học của tôi
 *     tags: [Enrollment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách khóa học đã đăng ký
 */

router.patch('/enroll', auth, userCtrl.enrollCourse);
router.get('/enrolled_courses', auth, userCtrl.getEnrolledCourses);

module.exports = router;