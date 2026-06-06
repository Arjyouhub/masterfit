import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  username: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  loginTime: { type: Date, default: Date.now },
  ipAddress: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

export default mongoose.model('Session', sessionSchema);
