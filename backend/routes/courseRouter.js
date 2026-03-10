const router = require('express').Router();
const courseCtrl = require('../controllers/courseCtrl');
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Lấy danh sách khóa học
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: Danh sách khóa học kèm thống kê Rating và StudentCount
 *   post:
 *     summary: Tạo khóa học mới (Chỉ dành cho Admin)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *               category:
 *                 type: string
 *               teacher:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tạo thành công
 */
router.route('/')
    .get(courseCtrl.getCourses)
    .post(auth, authAdmin, courseCtrl.createCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Lấy chi tiết một khóa học
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin chi tiết khóa học
 */
router.route('/')
    .get(courseCtrl.getCourses)
    .post(auth, authAdmin, courseCtrl.createCourse);

router.route('/:id')
    .get(courseCtrl.getCourseDetail)
    .put(auth, authAdmin, courseCtrl.updateCourse)    // 🆕 THÊM DÒNG NÀY ĐỂ SỬA
    .delete(auth, authAdmin, courseCtrl.deleteCourse); // 🆕 THÊM DÒNG NÀY ĐỂ XÓA

module.exports = router;