import mongoose from 'mongoose';

const feeAllocationSchema = new mongoose.Schema({
  feeMonth: { type: String, required: true }, // e.g. "2026-08"
  feeType: { type: String, enum: ['monthly', 'admission', 'custom'], default: 'monthly' },
  amount: { type: Number, required: true },
  description: { type: String, default: '' }
}, { _id: false });

const studentPaymentSubmissionSchema = new mongoose.Schema({
  submissionId: { type: String, required: true, unique: true, index: true },
  studentId: { type: Number, required: true, index: true },
  studentName: { type: String, required: true },
  branch: { type: String, required: true },
  batch: { type: String, required: true },
  paymentDate: { type: String, required: true }, // YYYY-MM-DD
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, required: true, default: 'UPI' },
  transactionId: { type: String, default: '' },
  feeAllocations: { type: [feeAllocationSchema], default: [] },
  proofImage: { type: String, default: '' }, // base64 representation or URL
  status: {
    type: String,
    enum: ['PAYMENT UNDER REVIEW', 'APPROVED', 'REJECTED'],
    default: 'PAYMENT UNDER REVIEW',
    index: true
  },
  rejectionReason: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date, default: null },
  approvedBy: { type: String, default: '' },
  rejectedAt: { type: Date, default: null },
  rejectedBy: { type: String, default: '' }
}, { timestamps: true });

studentPaymentSubmissionSchema.index({ studentId: 1, status: 1 });
studentPaymentSubmissionSchema.index({ branch: 1, status: 1 });

export default mongoose.model('StudentPaymentSubmission', studentPaymentSubmissionSchema);
