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
console.log('Dotenv path:', envPath);
try {
  console.log('Dotenv file content on disk:\n', fs.readFileSync(envPath, 'utf8'));
} catch (e) {
  console.error('Error reading dotenv file:', e);
}
dotenv.config({ path: envPath, override: true });

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

const app = express();
const PORT = process.env.PORT || 5000;

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

// Connect to MongoDB Atlas
console.log('Connecting to MongoDB URI:', process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance')
  .then(async () => {
    console.log('Successfully connected to MongoDB Atlas');
    await migratePlaintextPasswords();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Credentials seeding removed - relies entirely on existing database values.

// Routes
// 1. Get all students
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find({});
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Create student
app.post('/api/students', async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    const saved = await newStudent.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. Update student
app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Student.findOneAndUpdate({ id: Number(id) }, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Student not found' });
    res.json(updated);
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

// 5. Get all attendance records
app.get('/api/attendance', async (req, res) => {
  try {
    const records = await Attendance.find({});
    const attendanceMap = {};
    records.forEach(record => {
      const plainRecords = record.records instanceof Map ? Object.fromEntries(record.records) : record.records;
      attendanceMap[record.date] = plainRecords;
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
    
    const updated = await Attendance.findOneAndUpdate(
      { date },
      { date, records },
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
    const { loginType, username, password, branch, batch } = req.body;
    
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
          userAgent: req.headers['user-agent']
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
          userAgent: req.headers['user-agent']
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
    
    const session = await Session.findOne({ token });
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
      await Session.findOneAndDelete({ token });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all active sessions (Super Admin only)
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await Session.find({}).sort({ loginTime: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Terminate/Force Logout a session
app.delete('/api/sessions/:token', async (req, res) => {
  try {
    const { token } = req.params;
    await Session.findOneAndDelete({ token });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// In-memory OTP store
const otpStore = {};

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

    res.json({ success: true, message: 'OTP sent successfully' });
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
    const creds = await Credential.findOne({ configType: 'main' });
    if (!creds) {
      return res.json({ configType: 'main', adminCredentials: {}, branchCredentials: {}, batchCredentials: {} });
    }
    
    const safeCreds = creds.toJSON();
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
    const existing = await Credential.findOne({ configType: 'main' });
    
    if (body.adminCredentials) {
      for (const [user, pass] of Object.entries(body.adminCredentials)) {
        if (pass === '••••••' && existing) {
          // Password wasn't modified, restore the existing hash
          const oldHash = existing.adminCredentials instanceof Map 
            ? existing.adminCredentials.get(user) 
            : existing.adminCredentials[user];
          body.adminCredentials[user] = oldHash;
        } else if (pass && !pass.includes(':')) {
          body.adminCredentials[user] = hashPassword(pass);
        }
      }
    }
    if (body.branchCredentials) {
      for (const [br, creds] of Object.entries(body.branchCredentials)) {
        if (creds && creds.password) {
          if (creds.password === '••••••' && existing) {
            const oldHash = existing.branchCredentials instanceof Map
              ? existing.branchCredentials.get(br)?.password
              : existing.branchCredentials[br]?.password;
            creds.password = oldHash;
          } else if (!creds.password.includes(':')) {
            creds.password = hashPassword(creds.password);
          }
        }
      }
    }
    if (body.batchCredentials) {
      for (const [bt, creds] of Object.entries(body.batchCredentials)) {
        if (creds && creds.password) {
          if (creds.password === '••••••' && existing) {
            const oldHash = existing.batchCredentials instanceof Map
              ? existing.batchCredentials.get(bt)?.password
              : existing.batchCredentials[bt]?.password;
            creds.password = oldHash;
          } else if (!creds.password.includes(':')) {
            creds.password = hashPassword(creds.password);
          }
        }
      }
    }

    const updated = await Credential.findOneAndUpdate(
      { configType: 'main' },
      body,
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Express server is running on port ${PORT}`);
});
