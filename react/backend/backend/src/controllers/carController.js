import Car from '../models/Car.js';

export const getCars = async (req, res) => {
  const cars = await Car.find();
  res.json(cars);
};

export const getCar = async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (!car) return res.status(404).json({ error: 'Car not found' });
  res.json(car);
};

export const createCar = async (req, res) => {
  const car = new Car(req.body);
  await car.save();
  res.status(201).json(car);
};

export const updateCar = async (req, res) => {
  const car = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!car) return res.status(404).json({ error: 'Car not found' });
  res.json(car);
};

export const deleteCar = async (req, res) => {
  const car = await Car.findByIdAndDelete(req.params.id);
  if (!car) return res.status(404).json({ error: 'Car not found' });
  res.json({ message: 'Car deleted' });
};
