import mongoose from 'mongoose';

const feePaymentSchema = new mongoose.Schema({
  studentId: { type: Number, required: true, index: true },
  studentName: { type: String, default: '' },
  branch: { type: String, required: true, index: true },
  batch: { type: String, default: '', index: true },
  
  // Fee classification
  feeType: { type: String, enum: ['monthly', 'admission', 'custom'], default: 'monthly' },
  feeMonth: { type: String, required: true, index: true }, // The month for which fee is due, e.g. "2026-07"
  feeYear: { type: Number, required: true },
  
  // Financial amounts
  amountDue: { type: Number, required: true },
  amountPaid: { type: Number, required: true },
  balance: { type: Number, default: 0 },
  status: { type: String, enum: ['Paid', 'Partial', 'Pending'], default: 'Paid', index: true },
  
  // Actual Payment Transaction details (REVENUE IS STRICTLY BASED ON THIS)
  paymentDate: { type: String, required: true, index: true }, // "YYYY-MM-DD" in local time
  paymentMonth: { type: String, required: true, index: true }, // "YYYY-MM" derived from paymentDate
  paymentYear: { type: Number, required: true },
  
  // Revenue Accounting fields (Identical to paymentMonth/Year: Month(paymentDate))
  revenueMonth: { type: String, required: true, index: true }, // "YYYY-MM"
  revenueYear: { type: Number, required: true },
  
  // Receipt & Method
  receiptNumber: { type: String, required: true, unique: true, index: true },
  receiptNo: { type: String, default: function() { return this.receiptNumber; } },
  paymentMethod: { type: String, enum: ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Other'], default: 'Cash' },
  transactionRef: { type: String, default: '' },
  notes: { type: String, default: '' },
  collectedBy: { type: String, default: 'Admin' },
  
  // Flags
  needsReview: { type: Boolean, default: false }
}, { timestamps: true });

// Compound indexes for optimal aggregation performance
feePaymentSchema.index({ paymentDate: 1, branch: 1 });
feePaymentSchema.index({ revenueMonth: 1, branch: 1 });
feePaymentSchema.index({ feeMonth: 1, studentId: 1 });
feePaymentSchema.index({ studentId: 1, feeType: 1, feeMonth: 1 });

export default mongoose.model('FeePayment', feePaymentSchema);
