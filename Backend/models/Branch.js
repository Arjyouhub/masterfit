import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true, lowercase: true, trim: true },
  status: { type: String, required: true, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

branchSchema.index({ status: 1 });

export default mongoose.model('Branch', branchSchema);
