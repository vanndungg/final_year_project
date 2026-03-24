const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    paymentID: { type: String, required: true }, // Mã giao dịch (SePay hoặc Random)
    cart: { type: Array, default: [] },
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    total: { type: Number, required: true }, // Số tiền thanh toán
    status: { type: Boolean, default: true }
}, {
    timestamps: true
});

module.exports = mongoose.model("Payments", paymentSchema);