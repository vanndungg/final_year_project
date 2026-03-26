const router = require('express').Router();
const sepayCtrl = require('../controllers/sepayCtrl');

// Canonical endpoint: /api/sepay/webhook
router.post('/webhook', sepayCtrl.webhook);

// Compatibility endpoint when mounted at /webhook/sepay
router.post('/', sepayCtrl.webhook);

module.exports = router;