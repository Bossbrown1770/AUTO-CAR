import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  price: { type: Number, required: true },
  mileage: { type: Number, required: true },
  transmission: { type: String, required: true },
  fuelType: { type: String, required: true },
  color: { type: String, required: true },
  description: { type: String },
  features: [String],
  condition: { type: String },
  available: { type: Boolean, default: true },
  images: [String], // Array of image URLs
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Car', carSchema);
