const router = require('express').Router();
const userCtrl = require('../controllers/userCtrl');
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');

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

// 1. Lấy thông tin cá nhân
router.get('/infor', auth, userCtrl.getUser); 

// 2. Quản lý Giỏ hàng
router.patch('/addcart', auth, userCtrl.addCart);

// 3. Thanh toán
router.post('/checkout', auth, userCtrl.checkout);
router.post('/vnpay/create-order', auth, userCtrl.createVnpayOrder);
router.get('/vnpay/payment/:paymentId', auth, userCtrl.getVnpayPaymentStatus);
router.get('/vnpay/payment-url/:paymentId', auth, userCtrl.getVnpayPaymentUrl);

// 4. Đăng ký khóa học nhanh
router.patch('/enroll', auth, userCtrl.enrollCourse);

// 5. Lấy danh sách khóa học cá nhân
router.get('/enrolled_courses', auth, userCtrl.getEnrolledCourses);


// --- 🆕 ROUTES DÀNH CHO ADMIN (Thêm mới) ---

// 6. Lấy toàn bộ danh sách người dùng
// Đường dẫn: GET /api/users/all_info
router.get('/all_info', auth, authAdmin, userCtrl.getUsersAllInfor);

// 7. Cập nhật quyền (Admin/User)
// Đường dẫn: PATCH /api/users/update_role/:id
router.patch('/update_role/:id', auth, authAdmin, userCtrl.updateRole);

router.get('/admin_stats', auth, authAdmin, userCtrl.getAdminStats);

router.get('/course_performance', auth, authAdmin, userCtrl.getCoursePerformanceStats);
router.get('/successful_payments', auth, authAdmin, userCtrl.getSuccessfulPayments);

module.exports = router;