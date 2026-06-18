import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema({
  configKey: { type: String, required: true, default: 'main', unique: true },
  maintenanceMode: { type: Boolean, default: false },
  sessionTimeoutMinutes: { type: Number, default: 60 },
  minPasswordLength: { type: Number, default: 6 },
  failedLoginThreshold: { type: Number, default: 5 },
  failedLoginBlockTimeMinutes: { type: Number, default: 15 },
  logRetentionLimit: { type: Number, default: 1000 }
}, { timestamps: true });

export default mongoose.model('SystemSetting', systemSettingSchema);
