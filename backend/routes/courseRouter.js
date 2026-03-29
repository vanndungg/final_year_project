

const router = require('express').Router();
const courseCtrl = require('../controllers/courseCtrl');
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');
const authStaff = require('../middleware/authStaff');

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
    .post(auth, authStaff, courseCtrl.createCourse);

router.get('/:id/students-progress', auth, authStaff, courseCtrl.getCourseStudentsProgress);

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
router.route('/:id')
    .get(courseCtrl.getCourseDetail)
    .put(auth, authStaff, courseCtrl.updateCourse)
    .delete(auth, authAdmin, courseCtrl.deleteCourse);

module.exports = router;