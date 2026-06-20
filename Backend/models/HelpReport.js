import mongoose from 'mongoose';

const helpReportSchema = new mongoose.Schema({
  username: { type: String, required: true },
  role: { type: String, default: '' },
  branch: { type: String, default: '' },
  batch: { type: String, default: '' },
  issueDescription: { type: String, required: true },
  deviceName: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  ipAddress: { type: String, default: '' },
  status: { type: String, default: 'Pending' },
  developerReply: { type: String, default: '' },
  seenByUser: { type: Boolean, default: false },
  resolvedAt: { type: Date }
}, { timestamps: true });

helpReportSchema.index({ createdAt: -1 });

export default mongoose.model('HelpReport', helpReportSchema);
