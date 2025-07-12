const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    paymentOption: {
        type: String,
        required: true
    },
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car'
    }
});

module.exports = mongoose.model('Payment', PaymentSchema);
