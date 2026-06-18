import mongoose from 'mongoose';

const securityLogSchema = new mongoose.Schema({
  eventType: { type: String, required: true }, // 'FailedLogin', 'RoleChange', 'UserStatusUpdate', 'SessionTermination', 'DeveloperAudit'
  username: { type: String, required: true },
  description: { type: String, default: '' },
  ipAddress: { type: String, default: '' },
  userAgent: { type: String, default: '' }
}, { timestamps: true });

securityLogSchema.index({ eventType: 1, createdAt: -1 });

export default mongoose.model('SecurityLog', securityLogSchema);
