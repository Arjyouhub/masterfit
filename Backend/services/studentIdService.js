import crypto from 'crypto';
import Sequence from '../models/Sequence.js';
import Student from '../models/Student.js';
import StudentAuth from '../models/StudentAuth.js';

export const BRANCH_CODE_MAP = {
  'KUTTIADY': 'KTY',
  'ORKKATTERI': 'OKT',
  'ORAKATTERI': 'OKT',
  'PERAMBRA': 'PBR',
  'KALLACHI': 'KLC',
  'PARAKADAV': 'PKD',
  'DEVERGOVIL': 'DGV',
  'KALLIKANDY': 'KKD',
  'CHEMBRA': 'CHM',
  'THOOVAKUNN': 'TVK',
  'ELANKODE': 'ELK',
  'SIRAJUL HUDA': 'SJH',
  'SIRAJUL-HUDA': 'SJH'
};

export function getBranchCode(branchName) {
  if (!branchName) return 'KTY';
  const clean = String(branchName).toUpperCase().trim();
  if (BRANCH_CODE_MAP[clean]) return BRANCH_CODE_MAP[clean];
  const alphaOnly = clean.replace(/[^A-Z]/g, '');
  return alphaOnly.slice(0, 3) || 'KTY';
}

export function formatStudentId(seq, branchName = 'KUTTIADY') {
  const num = parseInt(seq, 10);
  const formattedNum = isNaN(num) ? '0001' : String(num).padStart(4, '0');
  const bCode = getBranchCode(branchName);
  return `MF-${bCode}-${formattedNum}`;
}

export function parseStudentIdNumber(studentIdStr) {
  if (!studentIdStr) return 0;
  const match = String(studentIdStr).match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Atomically generates the next sequential Student ID with branch code (e.g. MF-KTY-0001, MF-OKT-0002...)
 * Global counter across all branches. Concurrency safe.
 */
export async function getNextUniqueStudentId(branchName = 'KUTTIADY') {
  const seqDoc = await Sequence.findOneAndUpdate(
    { name: 'uniqueStudentId' },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return formatStudentId(seqDoc.value, branchName);
}

/**
 * Generates a cryptographically secure revocable QR code token for a student
 * Returns the raw QR payload to be encoded in the QR code, and updates the student doc with the hash
 */
export async function issueStudentQR(studentDoc) {
  const rawToken = crypto.randomBytes(24).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const currentVersion = (studentDoc.qrTokenVersion || 0) + 1;

  await Student.updateOne(
    { _id: studentDoc._id },
    {
      $set: {
        qrTokenHash: tokenHash,
        qrTokenVersion: currentVersion,
        qrStatus: 'Active'
      }
    }
  );

  // Return standard secure QR payload
  const qrPayload = JSON.stringify({
    academy: 'MASTERFIT',
    sid: studentDoc.uniqueStudentId,
    token: rawToken,
    v: currentVersion
  });

  return { qrPayload, rawToken, version: currentVersion };
}

/**
 * Validates a scanned QR payload against the database
 */
export async function validateStudentQRPayload(qrData) {
  try {
    let parsed = qrData;
    if (typeof qrData === 'string') {
      try {
        parsed = JSON.parse(qrData);
      } catch (e) {
        // Fallback: If scanned as plain Student ID like MF-KTY-0001 or URL
        if (qrData.includes('sid=')) {
          const urlParams = new URLSearchParams(qrData.split('?')[1] || '');
          parsed = {
            academy: 'MASTERFIT',
            sid: urlParams.get('sid'),
            token: urlParams.get('token'),
            v: parseInt(urlParams.get('v') || '1', 10)
          };
        } else if (/^MF/i.test(qrData.trim())) {
          parsed = { academy: 'MASTERFIT', sid: qrData.trim().toUpperCase() };
        } else {
          return { valid: false, error: 'Unrecognized QR code format. Please scan an official MASTERFIT ID card.' };
        }
      }
    }

    if (!parsed || !parsed.sid) {
      return { valid: false, error: 'Invalid MASTERFIT QR Code: Missing Student ID.' };
    }

    const cleanSid = String(parsed.sid).trim().toUpperCase();
    const cleanNum = parseStudentIdNumber(cleanSid);

    let student = await Student.findOne({ uniqueStudentId: cleanSid });
    if (!student && cleanNum) {
      student = await Student.findOne({
        $or: [
          { id: cleanNum },
          { admissionNumber: String(cleanNum) }
        ]
      });
    }

    if (!student) {
      return { valid: false, error: `Student with ID ${cleanSid} not found.` };
    }

    if (student.status && student.status.toLowerCase() !== 'active') {
      return { valid: false, error: `Student membership is currently ${student.status}. Access blocked.` };
    }

    if (student.qrStatus === 'Revoked') {
      return { valid: false, error: 'This ID card QR code has been revoked by academy administration. Please obtain a new card.' };
    }

    // If payload contains secure token, verify hash & version
    if (parsed.token) {
      const computedHash = crypto.createHash('sha256').update(String(parsed.token)).digest('hex');
      if (student.qrTokenHash && computedHash !== student.qrTokenHash) {
        return { valid: false, error: 'This QR code is obsolete or regenerated. Please use your latest MASTERFIT ID card.' };
      }
      if (parsed.v && student.qrTokenVersion && parsed.v !== student.qrTokenVersion) {
        return { valid: false, error: 'QR Code version mismatch. Please use your latest issued ID card.' };
      }
    }

    return {
      valid: true,
      student: {
        id: student.id,
        uniqueStudentId: student.uniqueStudentId,
        name: student.name,
        branch: student.branch,
        batch: student.batch,
        belt: student.belt,
        photo: student.photo,
        joinDate: student.joinDate,
        status: student.status
      }
    };
  } catch (err) {
    return { valid: false, error: 'QR validation error: ' + err.message };
  }
}

/**
 * Migration helper: Assigns permanent MF-{BRANCH}-XXXX IDs to all legacy students without overwriting existing IDs
 */
export async function migrateLegacyStudentIds() {
  const studentsWithoutId = await Student.find({
    $or: [
      { uniqueStudentId: { $exists: false } },
      { uniqueStudentId: null },
      { uniqueStudentId: '' },
      { uniqueStudentId: { $regex: /^MF-\d+$/i } } // Also upgrade any old MF-XXXX without branch
    ]
  }).sort({ id: 1, createdAt: 1 });

  let migratedCount = 0;
  for (const student of studentsWithoutId) {
    const num = parseStudentIdNumber(student.uniqueStudentId) || student.id || (migratedCount + 1);
    const newId = formatStudentId(num, student.branch);

    const updateFields = { uniqueStudentId: newId };
    if (!student.qrTokenHash) {
      const rawToken = crypto.randomBytes(24).toString('hex');
      updateFields.qrTokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      updateFields.qrTokenVersion = 1;
      updateFields.qrStatus = 'Active';
    }

    await Student.updateOne({ _id: student._id }, { $set: updateFields });

    // Synchronize with StudentAuth
    await StudentAuth.updateOne(
      { studentId: student.id },
      { $set: { uniqueStudentId: newId } }
    );

    migratedCount++;
  }

  console.log(`[MASTERFIT ID Migration] Migrated/Upgraded ${migratedCount} students to branch-coded format.`);
  return { migratedCount };
}
