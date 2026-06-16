import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';

import Student from './models/Student.js';
import Attendance from './models/Attendance.js';
import Credential from './models/Credential.js';
import Session from './models/Session.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath, override: true });
} else {
  dotenv.config();
}

// Password Hashing Helper Functions
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash) return false;
  if (!storedHash.includes(':')) {
    return password === storedHash; // Backwards compatibility for plain-text passwords
  }
  const [salt, hash] = storedHash.split(':');
  const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === checkHash;
}

// --- Secure Field-Level Database Encryption ---
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY || 'masterfit_db_encryption_key_32ch'; // Must be 32 bytes
const IV_LENGTH = 16;

function encrypt(text) {
  if (!text) return text;
  const textStr = String(text);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(textStr, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
  if (!text) return text;
  try {
    const textStr = String(text);
    const parts = textStr.split(':');
    if (parts.length !== 2) return text; // Not encrypted (fallback for backward compatibility)
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    // Fallback for unencrypted data or failed decryption
    return text;
  }
}

// Student field helpers
function encryptStudentData(data) {
  if (!data) return data;
  const doc = { ...data };
  if (doc.name) doc.name = encrypt(doc.name);
  if (doc.phone) doc.phone = encrypt(doc.phone);
  if (doc.photo) doc.photo = encrypt(doc.photo);
  return doc;
}

function decryptStudent(student) {
  if (!student) return student;
  const doc = student.toObject ? student.toObject({ flattenMaps: true }) : { ...student };
  if (doc.name) doc.name = decrypt(doc.name);
  if (doc.phone) doc.phone = decrypt(doc.phone);
  if (doc.photo) doc.photo = decrypt(doc.photo);
  return doc;
}

// Attendance field helpers
function encryptAttendanceRecords(records) {
  if (!records) return records;
  const encrypted = {};
  const entries = records instanceof Map ? Array.from(records.entries()) : Object.entries(records);
  for (const [studentId, status] of entries) {
    encrypted[studentId] = encrypt(status);
  }
  return encrypted;
}

function decryptAttendanceRecords(records) {
  if (!records) return records;
  const decrypted = {};
  const entries = records instanceof Map ? Array.from(records.entries()) : Object.entries(records);
  for (const [studentId, status] of entries) {
    decrypted[studentId] = decrypt(status);
  }
  return decrypted;
}


const app = express();
const PORT = process.env.PORT || 5000;

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Startup Password Migration Function
async function migratePlaintextPasswords() {
  try {
    const creds = await Credential.findOne({ configType: 'main' });
    if (!creds) {
      console.log('No credentials config document found to migrate.');
      return;
    }
    
    let updated = false;

    const getEntries = (obj) => {
      if (!obj) return [];
      if (obj instanceof Map) {
        return Array.from(obj.entries());
      }
      return Object.entries(obj);
    };

    const setValue = (obj, key, val) => {
      if (obj instanceof Map) {
        obj.set(key, val);
      } else {
        obj[key] = val;
      }
    };

    // 1. Admin Credentials
    const adminEntries = getEntries(creds.adminCredentials);
    for (const [user, pass] of adminEntries) {
      if (pass && !pass.includes(':')) {
        console.log(`Migrating plaintext password for admin: ${user}`);
        setValue(creds.adminCredentials, user, hashPassword(pass));
        updated = true;
      }
    }

    // 2. Branch Credentials
    const branchEntries = getEntries(creds.branchCredentials);
    for (const [br, info] of branchEntries) {
      if (info && info.password && !info.password.includes(':')) {
        console.log(`Migrating plaintext password for branch coordinator: ${br}`);
        const newInfo = { ...info, password: hashPassword(info.password) };
        setValue(creds.branchCredentials, br, newInfo);
        updated = true;
      }
    }

    // 3. Batch Credentials
    const batchEntries = getEntries(creds.batchCredentials);
    for (const [bt, info] of batchEntries) {
      if (info && info.password && !info.password.includes(':')) {
        console.log(`Migrating plaintext password for batch coordinator: ${bt}`);
        const newInfo = { ...info, password: hashPassword(info.password) };
        setValue(creds.batchCredentials, bt, newInfo);
        updated = true;
      }
    }

    if (updated) {
      creds.markModified('adminCredentials');
      creds.markModified('branchCredentials');
      creds.markModified('batchCredentials');
      await creds.save();
      console.log('Plaintext passwords successfully migrated to secure hashes in MongoDB Atlas.');
    } else {
      console.log('All database passwords are already securely hashed.');
    }
  } catch (err) {
    console.error('Error during password migration:', err);
  }
}

async function migrateDefaultRates() {
  try {
    const creds = await Credential.findOne({ configType: 'main' });
    if (creds) {
      let updated = false;
      if (creds.monthlyFeeRate === 1000) {
        creds.monthlyFeeRate = 600;
        updated = true;
      }
      if (creds.admissionFeeRate === 2000) {
        creds.admissionFeeRate = 1500;
        updated = true;
      }
      if (updated) {
        await creds.save();
        console.log('[Migration] Successfully updated default monthly fee to 600 and admission fee to 1500 in MongoDB.');
      }
    }
  } catch (err) {
    console.error('Error during default rates migration:', err);
  }
}

// Connect to MongoDB Atlas
console.log('Connecting to MongoDB URI:', process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI, { dbName: 'attendance' })
  .then(async () => {
    console.log('Successfully connected to MongoDB Atlas');
    await migratePlaintextPasswords();
    await migrateDefaultRates();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Credentials seeding removed - relies entirely on existing database values.

// Routes
// 1. Get all students (excl. photo for memory optimization)
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find({}).select('-photo').lean();
    res.json(students.map(decryptStudent));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1.1. Get student photo by ID (on-demand)
app.get('/api/students/:id/photo', async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findOne({ id: Number(id) }).select('photo').lean();
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json({ photo: decrypt(student.photo) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Create student
app.post('/api/students', async (req, res) => {
  try {
    const encryptedBody = encryptStudentData(req.body);
    const newStudent = new Student(encryptedBody);
    const saved = await newStudent.save();
    res.status(201).json(decryptStudent(saved));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. Update student
app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const encryptedBody = encryptStudentData(req.body);
    const updated = await Student.findOneAndUpdate({ id: Number(id) }, encryptedBody, { new: true });
    if (!updated) return res.status(404).json({ error: 'Student not found' });
    res.json(decryptStudent(updated));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. Delete student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Student.findOneAndDelete({ id: Number(id) });
    if (!deleted) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get all attendance records (using lean for memory efficiency)
app.get('/api/attendance', async (req, res) => {
  try {
    const records = await Attendance.find({}).lean();
    const attendanceMap = {};
    records.forEach(record => {
      const plainRecords = record.records instanceof Map ? Object.fromEntries(record.records) : record.records;
      const decryptedRecords = decryptAttendanceRecords(plainRecords);
      attendanceMap[record.date] = decryptedRecords;
    });
    res.json(attendanceMap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Save daily attendance
app.post('/api/attendance', async (req, res) => {
  try {
    const { date, records } = req.body;
    if (!date) return res.status(400).json({ error: 'Date is required' });
    
    const encryptedRecords = encryptAttendanceRecords(records);
    const updated = await Attendance.findOneAndUpdate(
      { date },
      { date, records: encryptedRecords },
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 7. Login validation
app.post('/api/login', async (req, res) => {
  try {
    const { loginType, username, password, branch, batch, deviceName } = req.body;
    
    const creds = await Credential.findOne({ configType: 'main' });
    if (!creds) {
      return res.status(500).json({ error: 'Credentials document not found' });
    }

    const enteredUser = username.toLowerCase().trim();

    if (loginType === 'superadmin') {
      const storedPasswordHash = creds.adminCredentials instanceof Map 
        ? creds.adminCredentials.get(enteredUser) 
        : creds.adminCredentials[enteredUser];
        
      if (storedPasswordHash && verifyPassword(password, storedPasswordHash)) {
        const token = crypto.randomBytes(32).toString('hex');
        await new Session({
          username: enteredUser,
          token,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          deviceName
        }).save();
        return res.json({ success: true, username: enteredUser, token });
      }
      return res.status(401).json({ success: false, error: 'Invalid admin username or password' });
    } else if (loginType === 'coordinator') {
      let isValid = false;
      let fullUsername = '';

      if (batch === 'admin') {
        const storedCreds = creds.branchCredentials instanceof Map 
          ? creds.branchCredentials.get(branch) 
          : creds.branchCredentials[branch];
          
        if (storedCreds) {
          const expectedUser1 = 'admin';
          const expectedUser2 = `admin@${branch}`;
          const customUser = (storedCreds.username || '').toLowerCase().trim();
          
          const isUserValid = enteredUser === expectedUser1 || enteredUser === expectedUser2 || (customUser && enteredUser === customUser);
          const isPasswordValid = verifyPassword(password, storedCreds.password);
          
          if (isUserValid && isPasswordValid) {
            isValid = true;
            fullUsername = `admin@${branch}`;
          }
        }
      } else {
        const branchBatchKey = `${branch}_${batch}`;
        let storedCreds = creds.batchCredentials instanceof Map 
          ? creds.batchCredentials.get(branchBatchKey) 
          : creds.batchCredentials[branchBatchKey];
          
        if (!storedCreds) {
          storedCreds = creds.batchCredentials instanceof Map 
            ? creds.batchCredentials.get(batch) 
            : creds.batchCredentials[batch];
        }
          
        if (storedCreds) {
          const expectedUser1 = batch;
          const expectedUser2 = `${batch}@${branch}`;
          const customUser = (storedCreds.username || '').toLowerCase().trim();
          
          const isUserValid = enteredUser === expectedUser1 || enteredUser === expectedUser2 || (customUser && enteredUser === customUser);
          const isPasswordValid = verifyPassword(password, storedCreds.password);
          
          if (isUserValid && isPasswordValid) {
            isValid = true;
            fullUsername = `${batch}@${branch}`;
          }
        }
      }

      if (isValid) {
        const token = crypto.randomBytes(32).toString('hex');
        await new Session({
          username: fullUsername,
          token,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          deviceName
        }).save();
        return res.json({ success: true, username: fullUsername, token });
      }
      return res.status(401).json({ success: false, error: 'Invalid username or password for selected branch and batch' });
    }

    return res.status(400).json({ success: false, error: 'Invalid login type' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Session verification endpoint
app.get('/api/session/verify', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ success: false, error: 'Token is required' });
    
    const session = await Session.findOne({ token }).lean();
    if (session) {
      return res.json({ success: true, username: session.username });
    }
    return res.status(401).json({ success: false, error: 'Session expired or invalid' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout endpoint
app.post('/api/logout', async (req, res) => {
  try {
    const { token } = req.body;
    if (token) {
      await Session.deleteOne({ token });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all active sessions (Super Admin only)
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await Session.find({}).sort({ loginTime: -1 }).lean();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Terminate/Force Logout a session
app.delete('/api/sessions/:token', async (req, res) => {
  try {
    const { token } = req.params;
    await Session.deleteOne({ token });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// In-memory OTP store
const otpStore = {};

// Periodically clean up expired OTPs every 5 minutes to prevent memory leaks
const OTP_CLEANUP_INTERVAL = 5 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const username in otpStore) {
    if (otpStore[username] && otpStore[username].expiresAt < now) {
      delete otpStore[username];
    }
  }
}, OTP_CLEANUP_INTERVAL).unref();

// --- Real-time SMS and WhatsApp OTP Dispatch Utilities ---
async function sendFast2SMS(phone, otp) {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) return false;
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${apiKey}&variables_values=${otp}&route=otp&numbers=${cleanPhone}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('[Fast2SMS API Response]:', data);
    return data.return === true;
  } catch (err) {
    console.error('Error sending Fast2SMS:', err);
    return false;
  }
}

async function sendCallMeBot(phone, otp) {
  const apiKey = process.env.CALLMEBOT_API_KEY;
  if (!apiKey) return false;
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
  const message = encodeURIComponent(`Your MASTER FIT admin password reset OTP code is: ${otp}. Valid for 5 minutes.`);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${message}&apikey=${apiKey}`;
  try {
    const response = await fetch(url);
    const text = await response.text();
    console.log('[CallMeBot API Response]:', text);
    return text.includes('Success') || response.status === 200;
  } catch (err) {
    console.error('Error sending CallMeBot:', err);
    return false;
  }
}

async function sendTwilio(phone, otp) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_PHONE;
  if (!sid || !token || !from) return false;
  
  let cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone.startsWith('+')) {
    if (cleanPhone.length === 10) cleanPhone = '+91' + cleanPhone;
    else cleanPhone = '+' + cleanPhone;
  }
  
  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  
  const bodyParams = new URLSearchParams();
  bodyParams.append('To', cleanPhone);
  bodyParams.append('From', from);
  bodyParams.append('Body', `Your MASTER FIT admin password reset OTP code is: ${otp}. Valid for 5 minutes.`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: bodyParams.toString()
    });
    const data = await response.json();
    console.log('[Twilio API Response]:', data);
    return response.ok;
  } catch (err) {
    console.error('Error sending Twilio:', err);
    return false;
  }
}

async function sendOTPMedia(phone, otp) {
  let sent = false;
  if (process.env.FAST2SMS_API_KEY) {
    const ok = await sendFast2SMS(phone, otp);
    if (ok) sent = true;
  }
  if (!sent && process.env.CALLMEBOT_API_KEY) {
    const ok = await sendCallMeBot(phone, otp);
    if (ok) sent = true;
  }
  if (!sent && process.env.TWILIO_ACCOUNT_SID) {
    const ok = await sendTwilio(phone, otp);
    if (ok) sent = true;
  }
  return sent;
}

// Send OTP for Super Admin Password Reset
app.post('/api/superadmin/forgot-password/send-otp', async (req, res) => {
  try {
    const { username, phone } = req.body;
    if (!username || !phone) {
      return res.status(400).json({ success: false, error: 'Username and phone number are required' });
    }

    const enteredUser = username.toLowerCase().trim();
    if (phone !== '9633380198') {
      return res.status(400).json({ success: false, error: 'Unauthorized phone number for admin password reset' });
    }

    const creds = await Credential.findOne({ configType: 'main' });
    if (!creds) {
      return res.status(500).json({ error: 'Credentials document not found' });
    }

    const storedPasswordHash = creds.adminCredentials instanceof Map 
      ? creds.adminCredentials.get(enteredUser) 
      : creds.adminCredentials[enteredUser];

    if (!storedPasswordHash) {
      return res.status(404).json({ success: false, error: 'Admin username not found' });
    }

    // Generate a secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[enteredUser] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes validity
    };

    console.log(`\n======================================================`);
    console.log(`[OTP SERVICE] Sent OTP ${otp} to 9633380198 for user '${enteredUser}'`);
    console.log(`======================================================\n`);

    const sentReal = await sendOTPMedia(phone, otp);
    const responseData = { success: true };
    if (!sentReal) {
      responseData.message = 'OTP logged to server console (Configure FAST2SMS_API_KEY or CALLMEBOT_API_KEY in .env for real SMS/WhatsApp)';
      responseData.debugOtp = otp;
    } else {
      responseData.message = 'OTP sent to your phone successfully';
    }

    res.json(responseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify OTP for Super Admin Password Reset
app.post('/api/superadmin/forgot-password/verify-otp', async (req, res) => {
  try {
    const { username, otp } = req.body;
    if (!username || !otp) {
      return res.status(400).json({ success: false, error: 'Username and OTP are required' });
    }

    const enteredUser = username.toLowerCase().trim();
    const record = otpStore[enteredUser];

    if (!record) {
      return res.status(400).json({ success: false, error: 'No OTP generated for this user' });
    }

    if (Date.now() > record.expiresAt) {
      delete otpStore[enteredUser];
      return res.status(400).json({ success: false, error: 'OTP has expired' });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ success: false, error: 'Invalid OTP code' });
    }

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset Password using OTP
app.post('/api/superadmin/forgot-password/reset', async (req, res) => {
  try {
    const { username, otp, newPassword } = req.body;
    if (!username || !otp || !newPassword) {
      return res.status(400).json({ success: false, error: 'Username, OTP, and new password are required' });
    }

    const enteredUser = username.toLowerCase().trim();
    const record = otpStore[enteredUser];

    if (!record) {
      return res.status(400).json({ success: false, error: 'No active OTP verification process' });
    }

    if (Date.now() > record.expiresAt) {
      delete otpStore[enteredUser];
      return res.status(400).json({ success: false, error: 'OTP has expired' });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ success: false, error: 'Invalid OTP code' });
    }

    // OTP verified, now reset the password
    const creds = await Credential.findOne({ configType: 'main' });
    if (!creds) {
      return res.status(500).json({ error: 'Credentials document not found' });
    }

    const hashedPassword = hashPassword(newPassword);
    if (creds.adminCredentials instanceof Map) {
      creds.adminCredentials.set(enteredUser, hashedPassword);
    } else {
      creds.adminCredentials[enteredUser] = hashedPassword;
    }

    creds.markModified('adminCredentials');
    await creds.save();

    delete otpStore[enteredUser];

    console.log(`[OTP SERVICE] Password reset completed successfully for admin user: ${enteredUser}`);
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Get credentials (passwords masked for security)
app.get('/api/credentials', async (req, res) => {
  try {
    const creds = await Credential.findOne({ configType: 'main' }).lean();
    if (!creds) {
      return res.json({ configType: 'main', adminCredentials: {}, branchCredentials: {}, batchCredentials: {} });
    }
    
    const safeCreds = { ...creds };
    if (safeCreds.adminCredentials) {
      for (const user of Object.keys(safeCreds.adminCredentials)) {
        safeCreds.adminCredentials[user] = '••••••';
      }
    }
    if (safeCreds.branchCredentials) {
      for (const br of Object.keys(safeCreds.branchCredentials)) {
        safeCreds.branchCredentials[br].password = '••••••';
      }
    }
    if (safeCreds.batchCredentials) {
      for (const bt of Object.keys(safeCreds.batchCredentials)) {
        safeCreds.batchCredentials[bt].password = '••••••';
      }
    }
    res.json(safeCreds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Update credentials (auto-hashes new passwords)
app.put('/api/credentials', async (req, res) => {
  try {
    const body = { ...req.body };

    // Fetch existing credentials to preserve un-modified hashed passwords
    let credsDoc = await Credential.findOne({ configType: 'main' });
    if (!credsDoc) {
      credsDoc = new Credential({ configType: 'main' });
    }

    if (body.adminCredentials) {
      for (const [user, pass] of Object.entries(body.adminCredentials)) {
        if (pass === '••••••' && credsDoc) {
          // Password wasn't modified, restore the existing hash
          const oldHash = credsDoc.adminCredentials instanceof Map 
            ? credsDoc.adminCredentials.get(user) 
            : credsDoc.adminCredentials[user];
          body.adminCredentials[user] = oldHash;
        } else if (pass && !pass.includes(':')) {
          body.adminCredentials[user] = hashPassword(pass);
        }
      }
      
      // Update the Mongoose Map and handle deletions
      const bodyKeys = Object.keys(body.adminCredentials);
      for (const key of Array.from(credsDoc.adminCredentials.keys())) {
        if (!bodyKeys.includes(key)) {
          credsDoc.adminCredentials.delete(key);
        }
      }
      for (const [user, pass] of Object.entries(body.adminCredentials)) {
        credsDoc.adminCredentials.set(user, pass);
      }
      credsDoc.markModified('adminCredentials');
    }

    if (body.branchCredentials) {
      for (const [br, creds] of Object.entries(body.branchCredentials)) {
        if (creds && creds.password) {
          if (creds.password === '••••••' && credsDoc) {
            const oldHash = credsDoc.branchCredentials instanceof Map
              ? credsDoc.branchCredentials.get(br)?.password
              : credsDoc.branchCredentials[br]?.password;
            creds.password = oldHash;
          } else if (!creds.password.includes(':')) {
            creds.password = hashPassword(creds.password);
          }
        }
      }

      // Update the Mongoose Map and handle deletions
      const bodyKeys = Object.keys(body.branchCredentials);
      for (const key of Array.from(credsDoc.branchCredentials.keys())) {
        if (!bodyKeys.includes(key)) {
          credsDoc.branchCredentials.delete(key);
        }
      }
      for (const [br, creds] of Object.entries(body.branchCredentials)) {
        credsDoc.branchCredentials.set(br, creds);
      }
      credsDoc.markModified('branchCredentials');
    }

    if (body.batchCredentials) {
      for (const [bt, creds] of Object.entries(body.batchCredentials)) {
        if (creds && creds.password) {
          if (creds.password === '••••••' && credsDoc) {
            const oldHash = credsDoc.batchCredentials instanceof Map
              ? credsDoc.batchCredentials.get(bt)?.password
              : credsDoc.batchCredentials[bt]?.password;
            creds.password = oldHash;
          } else if (!creds.password.includes(':')) {
            creds.password = hashPassword(creds.password);
          }
        }
      }

      // Update the Mongoose Map and handle deletions
      const bodyKeys = Object.keys(body.batchCredentials);
      for (const key of Array.from(credsDoc.batchCredentials.keys())) {
        if (!bodyKeys.includes(key)) {
          credsDoc.batchCredentials.delete(key);
        }
      }
      for (const [bt, creds] of Object.entries(body.batchCredentials)) {
        credsDoc.batchCredentials.set(bt, creds);
      }
      credsDoc.markModified('batchCredentials');
    }

    if (body.customBranches !== undefined) {
      credsDoc.customBranches = body.customBranches;
      credsDoc.markModified('customBranches');
    }

    if (body.customBatches !== undefined) {
      credsDoc.customBatches = body.customBatches;
      credsDoc.markModified('customBatches');
    }

    if (body.monthlyFeeRate !== undefined) {
      credsDoc.monthlyFeeRate = body.monthlyFeeRate;
      credsDoc.markModified('monthlyFeeRate');
    }

    if (body.admissionFeeRate !== undefined) {
      credsDoc.admissionFeeRate = body.admissionFeeRate;
      credsDoc.markModified('admissionFeeRate');
    }

    if (body.coupons) {
      if (!credsDoc.coupons) {
        credsDoc.coupons = new Map();
      }
      // Update the Mongoose Map and handle deletions
      const bodyKeys = Object.keys(body.coupons);
      for (const key of Array.from(credsDoc.coupons.keys())) {
        if (!bodyKeys.includes(key)) {
          credsDoc.coupons.delete(key);
        }
      }
      for (const [code, val] of Object.entries(body.coupons)) {
        credsDoc.coupons.set(code, val);
      }
      credsDoc.markModified('coupons');
    }

    await credsDoc.save();
    res.json(credsDoc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.listen(PORT, () => {
  console.log(`Express server is running on port ${PORT}`);
});
