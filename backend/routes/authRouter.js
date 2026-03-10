const router = require('express').Router();
const userCtrl = require('../controllers/userCtrl');

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
router.post('/register', userCtrl.register);

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
router.post('/login', userCtrl.login);

module.exports = router;