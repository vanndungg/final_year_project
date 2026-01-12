const router = require('express').Router();
const courseCtrl = require('../controllers/courseCtrl');
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Danh sach khoa hoc
 *     tags:
 *       - Courses
 *     responses:
 *       '200':
 *         description: OK
 *   post:
 *     summary: Tao khoa hoc
 *     tags:
 *       - Courses
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       '200':
 *         description: OK
 */
router.route('/courses')
    .get(courseCtrl.getCourses)
    .post(auth, authAdmin, courseCtrl.createCourse);

module.exports = router;