import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema({
  configKey: { type: String, required: true, default: 'main', unique: true },
  maintenanceMode: { type: String, default: 'none' }, // 'none' | 'all' | 'branch' | 'batch' | 'admin'
  maintenanceStart: { type: Date, default: null },
  maintenanceEnd: { type: Date, default: null },
  systemAlertMessage: { type: String, default: '' },
  systemUpdateNotification: { type: String, default: '' },
  systemUpdateNotificationId: { type: String, default: '' },
  sessionTimeoutMinutes: { type: Number, default: 60 },
  minPasswordLength: { type: Number, default: 6 },
  failedLoginThreshold: { type: Number, default: 5 },
  failedLoginBlockTimeMinutes: { type: Number, default: 15 },
  logRetentionLimit: { type: Number, default: 1000 },
  startingBillingMonth: { type: String, default: '' } // e.g. "2026-01"
}, { timestamps: true });

export default mongoose.model('SystemSetting', systemSettingSchema);
