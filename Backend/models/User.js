import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, default: '' },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['superadmin', 'branchadmin', 'coordinator', 'developer'] },
  branch: { type: String, default: '' },
  batch: { type: String, default: '' },
  status: { type: String, required: true, default: 'Active', enum: ['Active', 'Disabled', 'SoftDeleted'] }
}, { timestamps: true });

userSchema.index({ username: 1 });
userSchema.index({ status: 1 });

export default mongoose.model('User', userSchema);
