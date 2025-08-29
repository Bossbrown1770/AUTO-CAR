import express from 'express';
import { getCars, getCar, createCar, updateCar, deleteCar } from '../controllers/carController.js';

const router = express.Router();

router.get('/', getCars);
router.get('/:id', getCar);
router.post('/', createCar);
router.put('/:id', updateCar);
router.delete('/:id', deleteCar);

export default router;
