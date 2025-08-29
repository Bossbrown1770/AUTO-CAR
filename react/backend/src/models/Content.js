import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  about: { type: String, default: '' },
  contact: {
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    hours: { type: String, default: '' }
  }
});

export default mongoose.model('Content', contentSchema);
