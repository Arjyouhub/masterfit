import mongoose from 'mongoose';

const loginHistorySchema = new mongoose.Schema({
  username: { type: String, required: true },
  status: { type: String, required: true, enum: ['Success', 'Failed'] },
  ipAddress: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  deviceName: { type: String, default: '' }
}, { timestamps: true });

loginHistorySchema.index({ username: 1, createdAt: -1 });

export default mongoose.model('LoginHistory', loginHistorySchema);
