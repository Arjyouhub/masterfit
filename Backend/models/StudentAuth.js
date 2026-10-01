import mongoose from 'mongoose';

const studentAuthSchema = new mongoose.Schema({
  studentId: { type: Number, required: true, unique: true, index: true },
  mobileNumber: { type: String, required: true, index: true },
  mpinHash: { type: String, required: true },
  mustChangeMPIN: { type: Boolean, default: true },
  failedLoginAttempts: { type: Number, default: 0 },
  lockedUntil: { type: Date, default: null },
  lastLoginAt: { type: Date, default: null },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

studentAuthSchema.index({ mobileNumber: 1, isActive: 1 });

export default mongoose.model('StudentAuth', studentAuthSchema);
