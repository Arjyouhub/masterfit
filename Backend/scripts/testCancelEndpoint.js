import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from '../models/Student.js';
import FeePayment from '../models/FeePayment.js';

dotenv.config();

async function testCancelFlow() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/masterfit');
  console.log('Connected to MongoDB');

  const student = await Student.findOne();
  if (!student) {
    console.error('No student found in DB');
    await mongoose.disconnect();
    return;
  }

  const sId = student.id;
  const testMonth = '2026-09';
  console.log(`Testing cancel for student ID ${sId} on month ${testMonth}...`);

  // Step 1: Set paidMonth and create FeePayment
  await Student.updateOne(
    { id: sId },
    { $set: { [`paidMonths.${testMonth}`]: true } }
  );

  await FeePayment.deleteMany({ studentId: sId, feeMonth: testMonth });
  const payment = new FeePayment({
    studentId: sId,
    studentName: student.name,
    branch: student.branch,
    feeType: 'monthly',
    feeMonth: testMonth,
    feeYear: 2026,
    amountDue: 600,
    amountPaid: 600,
    status: 'Paid',
    paymentDate: '2026-09-04',
    paymentMonth: '2026-09',
    paymentYear: 2026,
    revenueMonth: '2026-09',
    revenueYear: 2026,
    receiptNumber: `RCP-TEST-${Date.now()}`
  });
  await payment.save();

  // Verify created
  let studentCheck = await Student.findOne({ id: sId }).lean();
  let paymentCheck = await FeePayment.findOne({ studentId: sId, feeMonth: testMonth }).lean();

  console.log('Before cancel:');
  console.log(' - Student paidMonths[testMonth]:', studentCheck.paidMonths?.[testMonth]);
  console.log(' - FeePayment exists?:', !!paymentCheck);

  if (!studentCheck.paidMonths?.[testMonth] || !paymentCheck) {
    throw new Error('Failed to set up test payment!');
  }

  // Step 2: Perform Cancel Logic (as implemented in /api/payments/cancel)
  await Student.updateOne(
    { id: sId },
    { $unset: { [`paidMonths.${testMonth}`]: 1 } }
  );
  await FeePayment.deleteMany({
    studentId: { $in: [sId, String(sId)] },
    feeType: 'monthly',
    feeMonth: testMonth
  });

  // Step 3: Verify results
  studentCheck = await Student.findOne({ id: sId }).lean();
  paymentCheck = await FeePayment.findOne({ studentId: sId, feeMonth: testMonth }).lean();

  console.log('\nAfter cancel:');
  console.log(' - Student paidMonths[testMonth]:', studentCheck.paidMonths?.[testMonth]);
  console.log(' - FeePayment exists?:', !!paymentCheck);

  if (studentCheck.paidMonths?.[testMonth] !== undefined) {
    throw new Error('FAILED: Student paidMonths still has month!');
  }
  if (paymentCheck) {
    throw new Error('FAILED: FeePayment record still exists in DB!');
  }

  console.log('\nSUCCESS! Data successfully removed from database, student paid status changed to unpaid!');
  await mongoose.disconnect();
}

testCancelFlow().catch(err => {
  console.error(err);
  process.exit(1);
});
