import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, lowercase: true, trim: true },
  branch: { type: String, required: true }, // Branch code/name, e.g., 'Kuttiady'
  trainer: { type: String, default: '' },   // Trainer username/name
  schedule: { type: String, required: true, default: 'Mon-Thu' },
  status: { type: String, required: true, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

batchSchema.index({ branch: 1, code: 1 }, { unique: true });
batchSchema.index({ code: 1 });
batchSchema.index({ branch: 1 });
batchSchema.index({ status: 1 });

export default mongoose.model('Batch', batchSchema);
