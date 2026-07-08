import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  dob: { type: String, default: 'N/A' },
  phone: { type: String, required: true },
  parentPhone: { type: String, default: 'N/A' },
  belt: { type: String, required: true, default: 'White' },
  joinDate: { type: String, required: true },
  batch: { type: String, required: true, default: 'Morning' },
  schedule: { type: String, required: true, default: 'Mon-Thu' },
  branch: { type: String, required: true, default: 'Kuttiady' },
  photo: { type: String, default: null }, // base64 representation of student photo
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
  lastGradingDate: { type: String, default: 'N/A' },
  nextEligibleGradingDate: { type: String, default: '' },
  lastGradingResult: { type: String, default: 'N/A' },
  gradingHistory: {
    type: [{
      gradingDate: { type: String, required: true },
      beltBefore: { type: String, required: true },
      result: { type: String, required: true, enum: ['Pass', 'Fail'] },
      beltAfter: { type: String, required: true },
      updatedBy: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }],
    default: []
  }
}, { timestamps: true });

studentSchema.index({ branch: 1, status: 1 });
studentSchema.index({ branch: 1, schedule: 1, status: 1 });

export default mongoose.model('Student', studentSchema);
