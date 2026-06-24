import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  className: { type: String, required: true },
  branch: { type: String, required: true },
  batch: { type: String, required: true },
  trainer: { type: String, required: true },
  startTime: { type: String, required: true }, // e.g. "09:00"
  endTime: { type: String, required: true },   // e.g. "10:30"
  subject: { type: String, default: '' }
}, { timestamps: true });

classSchema.index({ branch: 1 });
classSchema.index({ batch: 1 });
classSchema.index({ trainer: 1 });

export default mongoose.model('Class', classSchema);
