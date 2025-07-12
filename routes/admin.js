const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');

// Add car
router.post('/cars', auth, async (req, res) => {
    const { make, model, year, price, image } = req.body;

    try {
        const newCar = new Car({
            make,
            model,
            year,
            price,
            image
        });

        const car = await newCar.save();
        res.json(car);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get all cars
router.get('/cars', async (req, res) => {
    try {
        const cars = await Car.find();
        res.json(cars);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Update car
router.put('/cars/:id', auth, async (req, res) => {
    const { make, model, year, price, image } = req.body;

    const carFields = { make, model, year, price, image };

    try {
        let car = await Car.findById(req.params.id);

        if (!car) return res.status(404).json({ msg: 'Car not found' });

        car = await Car.findByIdAndUpdate(
            req.params.id,
            { $set: carFields },
            { new: true }
        );

        res.json(car);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Delete car
router.delete('/cars/:id', auth, async (req, res) => {
    try {
        let car = await Car.findById(req.params.id);

        if (!car) return res.status(404).json({ msg: 'Car not found' });

        await Car.findByIdAndRemove(req.params.id);

        res.json({ msg: 'Car removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get all payments
router.get('/payments', auth, async (req, res) => {
    try {
        const payments = await Payment.find().populate('car');
        res.json(payments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
