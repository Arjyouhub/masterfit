import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  username: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  loginTime: { type: Date, default: Date.now, expires: '7d' },
  branch: { type: String, default: '' },
  batch: { type: String, default: '' },
  ipAddress: { type: String },
  userAgent: { type: String },
  deviceName: { type: String },
  deviceType: { type: String, default: 'Desktop' },
  osName: { type: String, default: '' },
  osVersion: { type: String, default: '' },
  browserName: { type: String, default: '' },
  browserVersion: { type: String, default: '' },
  screenResolution: { type: String, default: '' }
}, { timestamps: true });

sessionSchema.index({ username: 1 });

export default mongoose.model('Session', sessionSchema);
