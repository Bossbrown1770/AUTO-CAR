import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import carRoutes from './src/routes/carRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import contentRoutes from './src/routes/contentRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/cars', carRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);

// Static for uploaded images (if using local storage)
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/autocentral', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch(err => console.error('MongoDB connection error:', err));
