import FeePayment from '../models/FeePayment.js';
import Student from '../models/Student.js';

/**
 * Generates a unique receipt number
 * Format: REC-YYYYMMDD-XXXXX
 */
export function generateReceiptNumber(dateStr) {
  const cleanDate = (dateStr || new Date().toISOString().slice(0, 10)).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  const time = Date.now().toString().slice(-4);
  return `REC-${cleanDate}-${time}${rand}`;
}

/**
 * Derives revenueMonth and revenueYear strictly from actual paymentDate
 * e.g. "2026-08-10" -> revenueMonth: "2026-08", revenueYear: 2026
 */
export function getRevenueMonthFromDate(paymentDateStr) {
  if (!paymentDateStr || typeof paymentDateStr !== 'string') {
    const now = new Date();
    const yr = now.getFullYear();
    const mo = String(now.getMonth() + 1).padStart(2, '0');
    return {
      paymentDate: `${yr}-${mo}-${String(now.getDate()).padStart(2, '0')}`,
      revenueMonth: `${yr}-${mo}`,
      revenueYear: yr
    };
  }
  const dateOnly = paymentDateStr.trim().slice(0, 10);
  const [yr, mo] = dateOnly.split('-');
  return {
    paymentDate: dateOnly,
    revenueMonth: `${yr}-${mo}`,
    revenueYear: parseInt(yr, 10)
  };
}

/**
 * Centralized Revenue Calculation Service
 * CRITICAL RULE: Revenue is strictly aggregated based on actual paymentDate (revenueMonth),
 * NEVER on feeMonth!
 */
export async function calculateRevenueByPaymentDate({ branch, batch, targetMonth, targetFeeMonth, user } = {}) {
  const matchFilter = {};

  // 1. Branch Authorization / Isolation (Case-insensitive & multi-branch)
  if (user && user.role !== 'superadmin' && user.role !== 'developer') {
    const userBranches = String(user.branch || '').split(',').map(b => b.trim()).filter(Boolean);
    if (userBranches.length === 1) {
      matchFilter.branch = new RegExp(`^${userBranches[0]}$`, 'i');
    } else if (userBranches.length > 1) {
      matchFilter.branch = { $in: userBranches.map(b => new RegExp(`^${b}$`, 'i')) };
    }
  } else if (branch && branch !== 'All' && branch.trim() !== '') {
    matchFilter.branch = new RegExp(`^${branch.trim()}$`, 'i');
  }

  // 2. Batch Filter
  if (batch && batch !== 'All') {
    matchFilter.batch = batch;
  }

  // Determine target revenue month (default to current calendar month in local time)
  const currentMonthStr = targetMonth || new Date().toISOString().slice(0, 7);
  const activeFeeMonth = targetFeeMonth || currentMonthStr;
  matchFilter.revenueMonth = currentMonthStr;

  // Aggregate payments received in target revenue month
  const payments = await FeePayment.find(matchFilter).lean();

  let totalCollected = 0;
  let monthlyFeeCollected = 0; // Strictly monthly fees belonging to activeFeeMonth
  let pastDuesCollected = 0; // Monthly fees belonging to other months (e.g. August fee paid in Sep)
  let admissionFeeCollected = 0;
  let otherFeeCollected = 0;

  const dailyBreakdown = {};
  const methodBreakdown = { Cash: 0, UPI: 0, 'Bank Transfer': 0, Card: 0, Other: 0 };
  const branchBreakdown = {};
  const batchBreakdown = {};

  for (const p of payments) {
    const amt = Number(p.amountPaid) || 0;
    totalCollected += amt;

    if (p.feeType === 'admission') {
      admissionFeeCollected += amt;
    } else if (p.feeType === 'monthly') {
      if (p.feeMonth === activeFeeMonth) {
        monthlyFeeCollected += amt;
      } else {
        pastDuesCollected += amt;
      }
    } else {
      otherFeeCollected += amt;
    }

    // Daily breakdown
    const day = p.paymentDate;
    dailyBreakdown[day] = (dailyBreakdown[day] || 0) + amt;

    // Payment method
    const method = p.paymentMethod || 'Cash';
    methodBreakdown[method] = (methodBreakdown[method] || 0) + amt;

    // Branch
    const br = p.branch || 'Unknown';
    branchBreakdown[br] = (branchBreakdown[br] || 0) + amt;

    // Batch
    const bat = p.batch || 'General';
    batchBreakdown[bat] = (batchBreakdown[bat] || 0) + amt;
  }

  return {
    targetMonth: currentMonthStr,
    activeFeeMonth,
    totalCollected: Math.round(totalCollected),
    monthlyFeeCollected: Math.round(monthlyFeeCollected),
    pastDuesCollected: Math.round(pastDuesCollected),
    admissionFeeCollected: Math.round(admissionFeeCollected),
    otherFeeCollected: Math.round(otherFeeCollected),
    paymentCount: payments.length,
    dailyBreakdown,
    methodBreakdown,
    branchBreakdown,
    batchBreakdown,
    payments
  };
}

/**
 * Get month-by-month historical revenue strictly by paymentDate (revenueMonth)
 */
export async function getRevenueTrends({ branch, batch, user } = {}) {
  const matchFilter = {};

  if (user && user.role !== 'superadmin' && user.role !== 'developer') {
    const userBranches = String(user.branch || '').split(',').map(b => b.trim()).filter(Boolean);
    if (userBranches.length === 1) {
      matchFilter.branch = new RegExp(`^${userBranches[0]}$`, 'i');
    } else if (userBranches.length > 1) {
      matchFilter.branch = { $in: userBranches.map(b => new RegExp(`^${b}$`, 'i')) };
    }
  } else if (branch && branch !== 'All' && branch.trim() !== '') {
    matchFilter.branch = new RegExp(`^${branch.trim()}$`, 'i');
  }

  if (batch && batch !== 'All') {
    matchFilter.batch = batch;
  }

  const pipeline = [
    { $match: matchFilter },
    {
      $group: {
        _id: '$revenueMonth', // Strictly group by revenueMonth = Month(paymentDate)
        totalRevenue: { $sum: '$amountPaid' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ];

  const results = await FeePayment.aggregate(pipeline);
  const trendMap = {};
  results.forEach(r => {
    if (r._id) {
      trendMap[r._id] = {
        totalRevenue: Math.round(r.totalRevenue),
        count: r.count
      };
    }
  });

  return trendMap;
}
