const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    paymentID: { type: String, required: true }, // Mã giao dịch (SePay hoặc Random)
    paymentCode: { type: String, default: '', index: true },
    cart: { type: Array, default: [] },
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    total: { type: Number, required: true }, // Số tiền thanh toán
    status: { type: String, default: 'pending' },
    gateway: { type: String, default: '' },
    transferType: { type: String, default: '' },
    transferAmount: { type: Number, default: 0 },
    accountNumber: { type: String, default: '' },
    transactionDate: { type: String, default: '' },
    referenceCode: { type: String, default: '' },
    sepayTransactionId: { type: Number, default: null },
    sepayWebhookIds: { type: [Number], default: [] },
    isFulfilled: { type: Boolean, default: false },
    paidAt: { type: Date, default: null },
    webhookRaw: { type: Object, default: null }
}, {
    timestamps: true
});

module.exports = mongoose.model("Payments", paymentSchema);