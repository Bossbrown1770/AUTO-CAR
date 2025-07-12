const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');

router.post('/', async (req, res) => {
    const { name, email, paymentOption, car } = req.body;

    try {
        const newPayment = new Payment({
            name,
            email,
            paymentOption,
            car
        });

        const payment = await newPayment.save();

        // Here you would implement the logic to send the payment details to your social media accounts
        // For now, we will just log the payment to the console
        console.log('Payment submitted:', payment);

        res.json(payment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
