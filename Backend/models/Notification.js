import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, required: true, default: 'general' }, // 'general' | 'maintenance' | 'update' | 'warning' | 'system'
  sender: { type: String, required: true, default: 'developer' },
  readBy: [{ type: String }], // Array of usernames who marked it as read
  priority: { type: String, default: 'medium', enum: ['low', 'medium', 'high'] },
  branch: { type: String, default: 'all' },
  batch: { type: String, default: 'all' },
  targetUser: { type: String, default: 'all' },
  expiryDate: { type: Date, default: null },
  scheduledAt: { type: Date, default: null },
  isScheduled: { type: Boolean, default: false }
}, { timestamps: true });

// Create indexes to optimize queries
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ branch: 1 });
notificationSchema.index({ batch: 1 });
notificationSchema.index({ targetUser: 1 });

export default mongoose.model('Notification', notificationSchema);
