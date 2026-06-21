import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, required: true, default: 'general' }, // 'general' | 'maintenance' | 'update' | 'warning' | 'system'
  sender: { type: String, required: true, default: 'developer' },
  readBy: [{ type: String }], // Array of usernames who marked it as read
}, { timestamps: true });

// Create indexes to optimize queries
notificationSchema.index({ createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
