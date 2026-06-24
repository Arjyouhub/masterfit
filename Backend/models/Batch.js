import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, lowercase: true, trim: true },
  batchName: { type: String, required: true },
  batchCode: { type: String, required: true, lowercase: true, trim: true },
  branch: { type: String, required: true }, // Branch code/name, e.g., 'Kuttiady'
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  branchName: { type: String, required: true },
  flaggedForReview: { type: Boolean, default: false },
  trainer: { type: String, default: '' },   // Trainer username/name
  schedule: { type: String, required: true, default: 'Mon-Thu' },
  startTime: { type: String, default: '09:00' },
  endTime: { type: String, default: '10:30' },
  slotType: { type: String, default: 'Morning' }, // Morning, Evening, Night
  status: { type: String, required: true, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

// Pre-validate middleware to keep name/code and batchName/batchCode in sync
batchSchema.pre('validate', function(next) {
  if (this.name && !this.batchName) {
    this.batchName = this.name;
  }
  if (this.code && !this.batchCode) {
    this.batchCode = this.code;
  }
  if (this.batchName && !this.name) {
    this.name = this.batchName;
  }
  if (this.batchCode && !this.code) {
    this.code = this.batchCode;
  }
  next();
});

batchSchema.index({ branch: 1, code: 1 }, { unique: true });
batchSchema.index({ code: 1 });
batchSchema.index({ branch: 1 });
batchSchema.index({ status: 1 });
batchSchema.index({ branchId: 1 });

export default mongoose.model('Batch', batchSchema);
