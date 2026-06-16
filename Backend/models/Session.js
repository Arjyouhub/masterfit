import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  username: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  loginTime: { type: Date, default: Date.now, expires: '7d' },
  ipAddress: { type: String },
  userAgent: { type: String },
  deviceName: { type: String }
}, { timestamps: true });

sessionSchema.index({ username: 1 });

export default mongoose.model('Session', sessionSchema);
