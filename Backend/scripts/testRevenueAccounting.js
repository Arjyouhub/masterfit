import dotenv from 'dotenv';
import mongoose from 'mongoose';
import FeePayment from '../models/FeePayment.js';
import { calculateRevenueByPaymentDate, getRevenueMonthFromDate } from '../services/revenueService.js';

dotenv.config();

async function runTests() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected.');

  // Use a dedicated test prefix for studentId and branch so test data never conflicts with real data
  const TEST_STUDENT_BASE = 999000;
  const TEST_BRANCH = 'TestBranch_AutoAccounting';
  const TEST_BRANCH_B = 'TestBranch_BranchB';

  try {
    // Cleanup any existing test records
    await FeePayment.deleteMany({ branch: { $in: [TEST_BRANCH, TEST_BRANCH_B] } });

    console.log('\n--- Starting Revenue Accounting Tests ---');

    // ==========================================
    // TEST 1: July fee ₹1,000 paid in July
    // ==========================================
    console.log('\n[TEST 1] July fee ₹1,000 paid on July 15');
    const p1Date = '2026-07-15';
    const { revenueMonth: r1Month, revenueYear: r1Year } = getRevenueMonthFromDate(p1Date);
    await FeePayment.create({
      studentId: TEST_STUDENT_BASE + 1,
      studentName: 'Test Student 1',
      branch: TEST_BRANCH,
      batch: 'Morning',
      feeType: 'monthly',
      feeMonth: '2026-07',
      feeYear: 2026,
      amountDue: 1000,
      amountPaid: 1000,
      balance: 0,
      status: 'Paid',
      paymentDate: p1Date,
      paymentMonth: r1Month,
      paymentYear: r1Year,
      revenueMonth: r1Month,
      revenueYear: r1Year,
      receiptNumber: 'REC-TEST-001',
      paymentMethod: 'UPI'
    });

    const t1July = await calculateRevenueByPaymentDate({ branch: TEST_BRANCH, targetMonth: '2026-07' });
    const t1Aug = await calculateRevenueByPaymentDate({ branch: TEST_BRANCH, targetMonth: '2026-08' });
    console.log(`TEST 1 Result: July Revenue = ₹${t1July.totalCollected}, August Revenue = ₹${t1Aug.totalCollected}`);
    if (t1July.totalCollected === 1000 && t1Aug.totalCollected === 0) {
      console.log('✅ TEST 1 PASSED: July fee paid in July counts ONLY in July revenue!');
    } else {
      throw new Error(`TEST 1 FAILED: Expected July=1000, Aug=0. Got July=${t1July.totalCollected}, Aug=${t1Aug.totalCollected}`);
    }

    // Cleanup for next test
    await FeePayment.deleteMany({ branch: TEST_BRANCH });

    // ==========================================
    // TEST 2: July fee ₹1,000 paid in August
    // ==========================================
    console.log('\n[TEST 2] July fee ₹1,000 paid on August 10');
    const p2Date = '2026-08-10';
    const { revenueMonth: r2Month, revenueYear: r2Year } = getRevenueMonthFromDate(p2Date);
    await FeePayment.create({
      studentId: TEST_STUDENT_BASE + 2,
      studentName: 'Test Student 2',
      branch: TEST_BRANCH,
      batch: 'Morning',
      feeType: 'monthly',
      feeMonth: '2026-07', // Fee is for July!
      feeYear: 2026,
      amountDue: 1000,
      amountPaid: 1000,
      balance: 0,
      status: 'Paid',
      paymentDate: p2Date, // Paid in August!
      paymentMonth: r2Month,
      paymentYear: r2Year,
      revenueMonth: r2Month,
      revenueYear: r2Year,
      receiptNumber: 'REC-TEST-002',
      paymentMethod: 'Cash'
    });

    const t2July = await calculateRevenueByPaymentDate({ branch: TEST_BRANCH, targetMonth: '2026-07' });
    const t2Aug = await calculateRevenueByPaymentDate({ branch: TEST_BRANCH, targetMonth: '2026-08' });
    console.log(`TEST 2 Result: July Revenue = ₹${t2July.totalCollected}, August Revenue = ₹${t2Aug.totalCollected}`);
    if (t2July.totalCollected === 0 && t2Aug.totalCollected === 1000) {
      console.log('✅ TEST 2 PASSED: July fee paid in August counts ONLY in August revenue and ₹0 in July revenue!');
    } else {
      throw new Error(`TEST 2 FAILED: Expected July=0, Aug=1000. Got July=${t2July.totalCollected}, Aug=${t2Aug.totalCollected}`);
    }

    // Cleanup for next test
    await FeePayment.deleteMany({ branch: TEST_BRANCH });

    // ==========================================
    // TEST 3: July fee ₹1,000 + August fee ₹1,000 both paid in August
    // ==========================================
    console.log('\n[TEST 3] July fee ₹1,000 + August fee ₹1,000 both paid on August 10');
    const p3Date = '2026-08-10';
    const { revenueMonth: r3Month, revenueYear: r3Year } = getRevenueMonthFromDate(p3Date);

    // July fee paid on Aug 10
    await FeePayment.create({
      studentId: TEST_STUDENT_BASE + 3,
      studentName: 'Test Student 3',
      branch: TEST_BRANCH,
      batch: 'Evening',
      feeType: 'monthly',
      feeMonth: '2026-07',
      feeYear: 2026,
      amountDue: 1000,
      amountPaid: 1000,
      balance: 0,
      status: 'Paid',
      paymentDate: p3Date,
      paymentMonth: r3Month,
      paymentYear: r3Year,
      revenueMonth: r3Month,
      revenueYear: r3Year,
      receiptNumber: 'REC-TEST-003A',
      paymentMethod: 'UPI'
    });

    // August fee paid on Aug 10
    await FeePayment.create({
      studentId: TEST_STUDENT_BASE + 3,
      studentName: 'Test Student 3',
      branch: TEST_BRANCH,
      batch: 'Evening',
      feeType: 'monthly',
      feeMonth: '2026-08',
      feeYear: 2026,
      amountDue: 1000,
      amountPaid: 1000,
      balance: 0,
      status: 'Paid',
      paymentDate: p3Date,
      paymentMonth: r3Month,
      paymentYear: r3Year,
      revenueMonth: r3Month,
      revenueYear: r3Year,
      receiptNumber: 'REC-TEST-003B',
      paymentMethod: 'UPI'
    });

    const t3July = await calculateRevenueByPaymentDate({ branch: TEST_BRANCH, targetMonth: '2026-07' });
    const t3Aug = await calculateRevenueByPaymentDate({ branch: TEST_BRANCH, targetMonth: '2026-08' });
    console.log(`TEST 3 Result: July Revenue = ₹${t3July.totalCollected}, August Revenue = ₹${t3Aug.totalCollected}`);
    if (t3July.totalCollected === 0 && t3Aug.totalCollected === 2000) {
      console.log('✅ TEST 3 PASSED: Both payments made in August count into August Revenue (₹2,000) and ₹0 in July!');
    } else {
      throw new Error(`TEST 3 FAILED: Expected July=0, Aug=2000. Got July=${t3July.totalCollected}, Aug=${t3Aug.totalCollected}`);
    }

    // Cleanup for next test
    await FeePayment.deleteMany({ branch: TEST_BRANCH });

    // ==========================================
    // TEST 4: Partial Payment (July fee ₹1,000 -> ₹500 in August, ₹500 in September)
    // ==========================================
    console.log('\n[TEST 4] July fee ₹1,000: ₹500 paid on August 10, ₹500 paid on September 05');
    await FeePayment.create({
      studentId: TEST_STUDENT_BASE + 4,
      studentName: 'Test Student 4',
      branch: TEST_BRANCH,
      batch: 'Morning',
      feeType: 'monthly',
      feeMonth: '2026-07',
      feeYear: 2026,
      amountDue: 1000,
      amountPaid: 500,
      balance: 500,
      status: 'Partial',
      paymentDate: '2026-08-10',
      paymentMonth: '2026-08',
      paymentYear: 2026,
      revenueMonth: '2026-08',
      revenueYear: 2026,
      receiptNumber: 'REC-TEST-004A',
      paymentMethod: 'Cash'
    });

    await FeePayment.create({
      studentId: TEST_STUDENT_BASE + 4,
      studentName: 'Test Student 4',
      branch: TEST_BRANCH,
      batch: 'Morning',
      feeType: 'monthly',
      feeMonth: '2026-07',
      feeYear: 2026,
      amountDue: 1000,
      amountPaid: 500,
      balance: 0,
      status: 'Paid',
      paymentDate: '2026-09-05',
      paymentMonth: '2026-09',
      paymentYear: 2026,
      revenueMonth: '2026-09',
      revenueYear: 2026,
      receiptNumber: 'REC-TEST-004B',
      paymentMethod: 'Cash'
    });

    const t4July = await calculateRevenueByPaymentDate({ branch: TEST_BRANCH, targetMonth: '2026-07' });
    const t4Aug = await calculateRevenueByPaymentDate({ branch: TEST_BRANCH, targetMonth: '2026-08' });
    const t4Sep = await calculateRevenueByPaymentDate({ branch: TEST_BRANCH, targetMonth: '2026-09' });
    console.log(`TEST 4 Result: July=₹${t4July.totalCollected}, August=₹${t4Aug.totalCollected}, September=₹${t4Sep.totalCollected}`);
    if (t4July.totalCollected === 0 && t4Aug.totalCollected === 500 && t4Sep.totalCollected === 500) {
      console.log('✅ TEST 4 PASSED: Partial payments strictly follow payment date (Aug=₹500, Sep=₹500, July=₹0)!');
    } else {
      throw new Error(`TEST 4 FAILED: Expected July=0, Aug=500, Sep=500. Got July=${t4July.totalCollected}, Aug=${t4Aug.totalCollected}, Sep=${t4Sep.totalCollected}`);
    }

    // Cleanup for next test
    await FeePayment.deleteMany({ branch: TEST_BRANCH });

    // ==========================================
    // TEST 5: July fee ₹1,000 paid in October
    // ==========================================
    console.log('\n[TEST 5] July fee ₹1,000 paid in October');
    await FeePayment.create({
      studentId: TEST_STUDENT_BASE + 5,
      studentName: 'Test Student 5',
      branch: TEST_BRANCH,
      batch: 'Morning',
      feeType: 'monthly',
      feeMonth: '2026-07',
      feeYear: 2026,
      amountDue: 1000,
      amountPaid: 1000,
      balance: 0,
      status: 'Paid',
      paymentDate: '2026-10-02',
      paymentMonth: '2026-10',
      paymentYear: 2026,
      revenueMonth: '2026-10',
      revenueYear: 2026,
      receiptNumber: 'REC-TEST-005',
      paymentMethod: 'Bank Transfer'
    });

    const t5July = await calculateRevenueByPaymentDate({ branch: TEST_BRANCH, targetMonth: '2026-07' });
    const t5Aug = await calculateRevenueByPaymentDate({ branch: TEST_BRANCH, targetMonth: '2026-08' });
    const t5Sep = await calculateRevenueByPaymentDate({ branch: TEST_BRANCH, targetMonth: '2026-09' });
    const t5Oct = await calculateRevenueByPaymentDate({ branch: TEST_BRANCH, targetMonth: '2026-10' });
    console.log(`TEST 5 Result: July=₹${t5July.totalCollected}, Aug=₹${t5Aug.totalCollected}, Sep=₹${t5Sep.totalCollected}, Oct=₹${t5Oct.totalCollected}`);
    if (t5July.totalCollected === 0 && t5Aug.totalCollected === 0 && t5Sep.totalCollected === 0 && t5Oct.totalCollected === 1000) {
      console.log('✅ TEST 5 PASSED: July fee paid in October counts ONLY in October (₹1,000) and ₹0 in all earlier months!');
    } else {
      throw new Error('TEST 5 FAILED');
    }

    // ==========================================
    // TEST 6: Branch Isolation Test
    // ==========================================
    console.log('\n[TEST 6] Branch Isolation Test');
    await FeePayment.create({
      studentId: TEST_STUDENT_BASE + 6,
      studentName: 'Test Student Branch B',
      branch: TEST_BRANCH_B,
      batch: 'Morning',
      feeType: 'monthly',
      feeMonth: '2026-10',
      feeYear: 2026,
      amountDue: 1000,
      amountPaid: 800,
      balance: 200,
      status: 'Partial',
      paymentDate: '2026-10-05',
      paymentMonth: '2026-10',
      paymentYear: 2026,
      revenueMonth: '2026-10',
      revenueYear: 2026,
      receiptNumber: 'REC-TEST-006',
      paymentMethod: 'Cash'
    });

    const userBranchA = { role: 'branchadmin', branch: TEST_BRANCH };
    const userBranchB = { role: 'branchadmin', branch: TEST_BRANCH_B };
    const userSuper = { role: 'superadmin' };

    const branchARev = await calculateRevenueByPaymentDate({ targetMonth: '2026-10', user: userBranchA });
    const branchBRev = await calculateRevenueByPaymentDate({ targetMonth: '2026-10', user: userBranchB });
    const superRev = await calculateRevenueByPaymentDate({ targetMonth: '2026-10', user: userSuper });

    console.log(`TEST 6 Result: Branch A sees ₹${branchARev.totalCollected}, Branch B sees ₹${branchBRev.totalCollected}`);
    if (branchARev.totalCollected === 1000 && branchBRev.totalCollected === 800) {
      console.log('✅ TEST 6 PASSED: Branch authorization strictly isolates revenue per branch!');
    } else {
      throw new Error(`TEST 6 FAILED: Expected Branch A=1000, Branch B=800. Got Branch A=${branchARev.totalCollected}, Branch B=${branchBRev.totalCollected}`);
    }

    console.log('\n🎉 ALL 6 ACCOUNTING TESTS PASSED SUCCESSFULLY! 🎉\n');
  } finally {
    // Final cleanup of test data
    await FeePayment.deleteMany({ branch: { $in: [TEST_BRANCH, TEST_BRANCH_B] } });
    await mongoose.disconnect();
    console.log('MongoDB disconnected. Clean test run complete.');
  }
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
