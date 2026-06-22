import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, default: '' },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['superadmin', 'branchadmin', 'trainer', 'developer'] },
  branch: { type: String, default: '' },
  batch: { type: String, default: '' },
  status: { type: String, required: true, default: 'Active', enum: ['Active', 'Disabled', 'SoftDeleted'] },
  fullName: { type: String, default: '' },
  phone: { type: String, default: '' },
  profilePhoto: { type: String, default: '' },
  employeeId: { type: String, default: '' },
  lastLoginAt: { type: Date, default: null },
  lastLogoutAt: { type: Date, default: null },
  loginCount: { type: Number, default: 0 },
  failedLoginCount: { type: Number, default: 0 },
  passwordChangedAt: { type: Date, default: null },
  isLocked: { type: Boolean, default: false },
  lockUntil: { type: Date, default: null },
  lockedAt: { type: Date, default: null },
  failedAttempts: { type: Number, default: 0 }
}, { timestamps: true });

userSchema.index({ username: 1 });
userSchema.index({ status: 1 });

export default mongoose.model('User', userSchema);
