import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  className: { type: String, required: true },
  branch: { type: String, required: true },
  batch: { type: String, required: true },
  trainer: { type: String, required: true },
  startTime: { type: String, default: '' }, // e.g. "09:00"
  endTime: { type: String, default: '' },   // e.g. "10:30"
  subject: { type: String, default: '' },
  date: { type: String, required: true },      // YYYY-MM-DD
  status: { type: String, enum: ['scheduled', 'cancelled'], default: 'scheduled' },
  cancellationReason: { type: String, default: '' },
  schedule: { type: String, default: '' },
  slotType: { type: String, default: 'Morning' }
}, { timestamps: true });

classSchema.index({ branch: 1 });
classSchema.index({ batch: 1 });
classSchema.index({ trainer: 1 });
classSchema.index({ date: 1 });

export default mongoose.model('Class', classSchema);
