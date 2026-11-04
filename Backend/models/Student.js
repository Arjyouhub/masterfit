import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  uniqueStudentId: { type: String, unique: true, sparse: true }, // Format: MF-0001
  name: { type: String, required: true },
  age: { type: Number, default: 0 },
  dob: { type: String, default: 'N/A' },
  phone: { type: String, required: true },
  parentPhone: { type: String, default: 'N/A' },
  bloodGroup: { type: String, default: '' },
  belt: { type: String, required: true, default: 'White' },
  joinDate: { type: String, required: true },
  batch: { type: String, required: true, default: 'Morning' },
  batchId: { type: String, default: '' },
  schedule: { type: String, required: true, default: 'Mon-Thu' },
  branch: { type: String, required: true, default: 'Kuttiady' },
  branchId: { type: String, default: '' },
  photo: { type: String, default: null }, // base64 representation of student photo
  trainer: { type: String, default: '' },
  art: { type: String, default: '' },
  status: { type: String, required: true, default: 'Active' },
  admissionPaid: { type: mongoose.Schema.Types.Mixed, default: false }, // false or Year-Month string
  paidMonths: { type: Map, of: Boolean, default: {} }, // YYYY-MM -> true
  performanceScore: { type: Number, default: 50 },
  customMonthlyRate: { type: Number, default: null }, // custom monthly rate override
  customAdmissionRate: { type: Number, default: null }, // custom admission rate override
  appliedCoupon: { type: String, default: '' }, // applied coupon code
  appliedAdmissionCoupon: { type: String, default: '' }, // applied admission coupon code
  discountPercentage: { type: Number, default: 0 }, // discount percentage
  couponType: { type: String, default: 'percentage' }, // 'percentage' or 'amount'
  couponValue: { type: Number, default: 0 }, // discount value (percentage or flat amount)
  appliedCoupons: {
    type: [{
      couponId: { type: String },
      couponCode: { type: String, required: true },
      discountType: { type: String, required: true },
      discountValue: { type: Number, required: true },
      appliedMonth: { type: Number, required: true },
      appliedYear: { type: Number, required: true },
      appliedAt: { type: Date, default: Date.now }
    }],
    default: []
  },
  lastGradingDate: { type: String, default: 'N/A' },
  nextEligibleGradingDate: { type: String, default: '' },
  eligibilityOverride: { type: String, default: '' },
  lastGradingResult: { type: String, default: 'N/A' },
  lastGradeLetter: { type: String, default: '' },
  gradingHistory: {
    type: [{
      gradingDate: { type: String, required: true },
      beltBefore: { type: String, required: true },
      result: { type: String, required: true, enum: ['Pass', 'Fail'] },
      gradeLetter: { type: String, default: '' },
      beltAfter: { type: String, required: true },
      updatedBy: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }],
    default: []
  },
  isPriority: { type: Boolean, default: false },
  trainerApprovedForGrading: { type: Boolean, default: false },
  trainerApprovedBy: { type: String, default: '' },
  trainerApprovedAt: { type: String, default: '' },
  trainerSuggestedBelt: { type: String, default: '' },
  trainerBeltSize: { type: String, default: '' },
  trainerGradingNotes: { type: String, default: '' },
  
  // QR & ID Card Management
  qrTokenHash: { type: String, default: '' },
  qrTokenVersion: { type: Number, default: 1 },
  qrStatus: { type: String, enum: ['Active', 'Revoked'], default: 'Active' },
  idCardGeneratedAt: { type: Date, default: null },
  idCardStatus: { type: String, enum: ['Pending', 'Generated', 'Printed'], default: 'Pending' }
}, { timestamps: true });

studentSchema.index({ branch: 1, status: 1 });
studentSchema.index({ branch: 1, schedule: 1, status: 1 });

export default mongoose.model('Student', studentSchema);
