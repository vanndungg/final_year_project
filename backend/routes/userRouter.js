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

// 1. Lấy thông tin cá nhân (Quan trọng nhất để hiện tên lên Header)
// Đường dẫn đầy đủ: GET /api/users/infor
router.get('/infor', auth, userCtrl.getUser); 

// 2. Quản lý Giỏ hàng
// Đường dẫn đầy đủ: PATCH /api/users/addcart
router.patch('/addcart', auth, userCtrl.addCart);

// 3. Thanh toán (Chuyển giỏ hàng sang khóa học sở hữu)
// Đường dẫn đầy đủ: POST /api/users/checkout
router.post('/checkout', auth, userCtrl.checkout);

// 4. Đăng ký khóa học nhanh
// Đường dẫn đầy đủ: PATCH /api/users/enroll
router.patch('/enroll', auth, userCtrl.enrollCourse);

// 5. Lấy danh sách khóa học của tôi
// Đường dẫn đầy đủ: GET /api/users/enrolled_courses
router.get('/enrolled_courses', auth, userCtrl.getEnrolledCourses);

module.exports = router;