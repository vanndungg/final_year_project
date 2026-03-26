const router = require('express').Router();
const vnpayCtrl = require('../controllers/vnpayCtrl');

// VNPAY server-to-server callback (IPN)
router.get('/ipn', vnpayCtrl.ipn);

// Browser return URL callback
router.get('/return', vnpayCtrl.returnUrl);

module.exports = router;
