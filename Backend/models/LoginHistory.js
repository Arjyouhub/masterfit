import mongoose from 'mongoose';

const loginHistorySchema = new mongoose.Schema({
  username: { type: String, required: true },
  status: { type: String, required: true, enum: ['Success', 'Failed'] },
  ipAddress: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  deviceName: { type: String, default: '' },
  logoutAt: { type: Date, default: null },
  sessionDuration: { type: Number, default: 0 },
  sessionToken: { type: String, default: '' },
  deviceType: { type: String, default: 'Desktop' },
  osName: { type: String, default: '' },
  osVersion: { type: String, default: '' },
  browserName: { type: String, default: '' },
  browserVersion: { type: String, default: '' },
  screenResolution: { type: String, default: '' }
}, { timestamps: true });

loginHistorySchema.index({ username: 1, createdAt: -1 });

export default mongoose.model('LoginHistory', loginHistorySchema);
