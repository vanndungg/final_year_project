const router = require('express').Router();
const authCtrl = require('../controllers/authCtrl');

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Dang ky
 *     tags:
 *       - Auth
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: OK
 */
router.post('/register', authCtrl.register);

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Dang nhap
 *     tags:
 *       - Auth
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: OK
 */
router.post('/login', authCtrl.login);

module.exports = router;