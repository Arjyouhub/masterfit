import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import os from 'os';

import Student from './models/Student.js';
import Attendance from './models/Attendance.js';
import Credential from './models/Credential.js';
import Session from './models/Session.js';
import User from './models/User.js';
import LoginHistory from './models/LoginHistory.js';
import SecurityLog from './models/SecurityLog.js';
import SystemSetting from './models/SystemSetting.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath, override: true });
} else {
  dotenv.config();
}

// Console logs in-memory buffer for developer diagnostics
const appLogs = [];

let cachedSettings = {
  maintenanceMode: false,
  sessionTimeoutMinutes: 60,
  minPasswordLength: 6,
  failedLoginThreshold: 5,
  failedLoginBlockTimeMinutes: 15,
  logRetentionLimit: 1000
};

function addLog(type, message) {
  appLogs.push({ type, message, timestamp: new Date() });
  const limit = cachedSettings.logRetentionLimit || 1000;
  if (appLogs.length > limit) {
    appLogs.shift();
  }
}

// IP & User Agent Helpers for Proxy-aware Audits
const getClientIp = (req) => {
  // Cloudflare Connecting IP
  let ip = req.headers['cf-connecting-ip'];
  
  // X-Forwarded-For (can be comma-separated list of IPs)
  if (!ip && req.headers['x-forwarded-for']) {
    const ips = req.headers['x-forwarded-for'].split(',');
    ip = ips[0].trim();
  }
  
  // X-Real-IP
  if (!ip && req.headers['x-real-ip']) {
    ip = req.headers['x-real-ip'];
  }
  
  // Express req.ip fallback
  if (!ip) {
    ip = req.ip || req.connection?.remoteAddress || '';
  }
  
  // Clean loopbacks
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    ip = '127.0.0.1';
  }
  
  return ip;
};

const parseUserAgent = (ua) => {
  if (!ua) return { deviceType: 'Unknown', osName: 'Unknown OS', osVersion: '', browserName: 'Unknown Browser', browserVersion: '' };
  
  let deviceType = 'Desktop';
  let osName = 'Unknown OS';
  let osVersion = '';
  let browserName = 'Unknown Browser';
  let browserVersion = '';

  // Device Type
  if (/mobile/i.test(ua)) {
    deviceType = 'Mobile';
  } else if (/tablet|ipad/i.test(ua)) {
    deviceType = 'Tablet';
  }
  
  // OS Detection
  if (/windows/i.test(ua)) {
    osName = 'Windows';
    const match = ua.match(/Windows NT ([\d.]+)/);
    if (match) osVersion = match[1];
  } else if (/macintosh/i.test(ua)) {
    osName = 'macOS';
    const match = ua.match(/Mac OS X ([\d_]+)/);
    if (match) osVersion = match[1].replace(/_/g, '.');
  } else if (/android/i.test(ua)) {
    osName = 'Android';
    const match = ua.match(/Android ([\d.]+)/);
    if (match) osVersion = match[1];
    deviceType = 'Mobile';
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    osName = 'iOS';
    const match = ua.match(/OS ([\d_]+)/);
    if (match) osVersion = match[1].replace(/_/g, '.');
    deviceType = /ipad/i.test(ua) ? 'Tablet' : 'Mobile';
  } else if (/linux/i.test(ua)) {
    osName = 'Linux';
  }

  // Browser Detection
  if (/edg/i.test(ua)) {
    browserName = 'Edge';
    const match = ua.match(/Edg\/([\d.]+)/);
    if (match) browserVersion = match[1];
  } else if (/chrome/i.test(ua) && !/chromium/i.test(ua)) {
    browserName = 'Chrome';
    const match = ua.match(/Chrome\/([\d.]+)/);
    if (match) browserVersion = match[1];
  } else if (/firefox/i.test(ua)) {
    browserName = 'Firefox';
    const match = ua.match(/Firefox\/([\d.]+)/);
    if (match) browserVersion = match[1];
  } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
    browserName = 'Safari';
    const match = ua.match(/Version\/([\d.]+)/);
    if (match) browserVersion = match[1];
  }

  return { deviceType, osName, osVersion, browserName, browserVersion };
};
const originalLog = console.log;
console.log = (...args) => {
  addLog('info', args.join(' '));
  originalLog(...args);
};
const originalError = console.error;
console.error = (...args) => {
  addLog('error', args.join(' '));
  originalError(...args);
};

// Password Hashing Helper Functions (Upgraded to 210,000 iterations with backwards compatibility)
const CURRENT_ITERATIONS = 210000;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, CURRENT_ITERATIONS, 64, 'sha512').toString('hex');
  return `pbkdf2:${CURRENT_ITERATIONS}:${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash) return false;
  
  // Backwards compatibility for plain-text passwords
  if (!storedHash.includes(':')) {
    return password === storedHash;
  }
  
  const parts = storedHash.split(':');
  
  // Upgraded pbkdf2 format: pbkdf2:iterations:salt:hash
  if (parts[0] === 'pbkdf2') {
    const iterations = parseInt(parts[1], 10);
    const salt = parts[2];
    const hash = parts[3];
    if (isNaN(iterations) || !salt || !hash) return false;
    const checkHash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
    return hash === checkHash;
  }
  
  // Old format: salt:hash (with 1000 iterations)
  const [salt, hash] = parts;
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

// Helper to retrieve custom batch schedule
async function getBatchSchedule(batchId) {
  if (!batchId) return null;
  const defaults = {
    batch1: 'Mon-Thu',
    batch2: 'Tue-Fri',
    batch3: 'Wed-Sat'
  };
  const key = String(batchId).toLowerCase().trim();
  if (defaults[key]) {
    return defaults[key];
  }
  const creds = await Credential.findOne({ configType: 'main' }).lean();
  if (creds && creds.customBatches) {
    const custom = creds.customBatches.find(b => String(b.id).toLowerCase().trim() === key);
    if (custom) return custom.schedule;
  }
  return null;
}

// Helper to extract role and details from username
function getAuthDetails(username) {
  if (!username) return { role: null, branch: null, batch: null };
  const cleanUsername = String(username).toLowerCase().trim();
  if (cleanUsername === 'developer' || cleanUsername.startsWith('developer@')) {
    const parts = cleanUsername.split('@');
    return { role: 'developer', branch: parts[1] || 'all', batch: 'all' };
  }
  if (!cleanUsername.includes('@')) {
    return { role: 'superadmin', branch: 'all', batch: 'all' };
  }
  const [userPart, branchPart] = cleanUsername.split('@');
  if (userPart === 'admin') {
    return { role: 'branchadmin', branch: branchPart, batch: 'all' };
  }
  return { role: 'coordinator', branch: branchPart, batch: userPart };
}

// Authentication Middleware
const authenticateSession = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    let token = (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null) || req.query.token || req.body.token;

    if (!token || typeof token !== 'string') {
      return res.status(401).json({ error: 'Authentication token is required' });
    }

    // Coerce to string to prevent object injection queries in Session.findOne
    token = String(token).trim();

    const session = await Session.findOne({ token }).lean();
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // --- ENFORCE SESSION TIMEOUT ---
    const maxAgeMs = (cachedSettings.sessionTimeoutMinutes || 60) * 60 * 1000;
    const ageMs = Date.now() - new Date(session.updatedAt || session.createdAt).getTime();
    if (ageMs > maxAgeMs) {
      await Session.deleteOne({ token });
      return res.status(401).json({ error: 'Session expired due to inactivity. Please log in again.' });
    }
    // Update session last activity
    await Session.updateOne({ token }, { updatedAt: new Date() });

    // Fetch the User details from the database User collection to get DB-driven role, branch, and batch
    const userDoc = await User.findOne({ username: session.username.toLowerCase().trim() }).lean();
    if (!userDoc) {
      return res.status(401).json({ error: 'Associated user account not found.' });
    }

    req.user = {
      ...session,
      role: userDoc.role,
      branch: userDoc.branch,
      batch: userDoc.batch
    };

    // --- ENFORCE MAINTENANCE MODE ---
    if (cachedSettings.maintenanceMode) {
      if (req.user.role !== 'developer') {
        return res.status(503).json({ error: 'System is undergoing scheduled maintenance. Access is restricted to developers.' });
      }
    }

    next();
  } catch (err) {
    res.status(500).json({ error: 'Authentication error: ' + err.message });
  }
};

// Role Authorization Middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }
    next();
  };
};

// Developer Auth Guard Middleware
const authorizeDeveloper = (req, res, next) => {
  if (req.user.role !== 'developer') {
    return res.status(403).json({ error: 'Access denied: Developer privilege required' });
  }
  next();
};

const app = express();
app.set('trust proxy', true);
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(mongoSanitize());

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    let logUrl = req.originalUrl || req.url;
    // Redact token in query parameters to prevent exposing session tokens in terminal logs
    logUrl = logUrl.replace(/([\?&]token=)[^&]+/g, '$1[REDACTED]');
    
    const logMsg = `${req.method} ${logUrl} - ${res.statusCode} (${duration}ms) - IP: ${req.ip}`;
    
    if (res.statusCode >= 400) {
      addLog('error', logMsg);
    } else if (logUrl.includes('/api/login') || logUrl.includes('/api/session/verify') || logUrl.includes('/api/developer/sessions')) {
      addLog('auth', logMsg);
    } else if (logUrl.startsWith('/api')) {
      addLog('api', logMsg);
    } else {
      addLog('info', logMsg);
    }
    
    originalLog(`[${new Date().toISOString()}] ${logMsg}`);
  });
  next();
});
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Startup User Sync & Seed Routine
async function syncUsersAndSeed() {
  try {
    const creds = await Credential.findOne({ configType: 'main' });
    if (!creds) {
      console.log('No credentials config document found to sync users.');
      return;
    }

    const getEntries = (obj) => {
      if (!obj) return [];
      if (obj instanceof Map) {
        return Array.from(obj.entries());
      }
      return Object.entries(obj);
    };

    const activeUsernames = new Set();
    activeUsernames.add('developer');

    const upsertUser = async (username, password, role, branch = '', batch = '') => {
      const uClean = username.toLowerCase().trim();
      activeUsernames.add(uClean);
      const existing = await User.findOne({ username: uClean });
      if (!existing) {
        await new User({
          username: uClean,
          password,
          role,
          branch,
          batch,
          status: 'Active'
        }).save();
        console.log(`[Sync] Created User account for ${uClean} (Role: ${role})`);
      } else {
        let changed = false;
        if (existing.password !== password) {
          existing.password = password;
          changed = true;
        }
        if (existing.role !== role) {
          existing.role = role;
          changed = true;
        }
        if (existing.branch !== branch) {
          existing.branch = branch;
          changed = true;
        }
        if (existing.batch !== batch) {
          existing.batch = batch;
          changed = true;
        }
        if (existing.status !== 'Active') {
          existing.status = 'Active';
          changed = true;
        }
        if (changed) {
          await existing.save();
          console.log(`[Sync] Updated User account details for ${uClean}`);
        }
      }
    };

    // 1. Sync Superadmins
    const adminEntries = getEntries(creds.adminCredentials);
    for (const [user, pass] of adminEntries) {
      if (pass) {
        const role = user.toLowerCase().trim() === 'developer' ? 'developer' : 'superadmin';
        await upsertUser(user, pass, role);
      }
    }

    // 2. Sync Branch Coordinators
    const branchEntries = getEntries(creds.branchCredentials);
    for (const [br, info] of branchEntries) {
      if (info && info.password) {
        const username = info.username || `admin@${br}`;
        await upsertUser(username, info.password, 'branchadmin', br);
      }
    }

    // 3. Sync Batch Coordinators
    const batchEntries = getEntries(creds.batchCredentials);
    for (const [key, info] of batchEntries) {
      if (info && info.password) {
        const parts = key.split('_');
        const br = parts[0];
        const bt = parts.slice(1).join('_');
        const username = info.username || `${bt}@${br}`;
        await upsertUser(username, info.password, 'coordinator', br, bt);
      }
    }

    // 4. Seed Developer
    const devClean = 'developer';
    const devUser = await User.findOne({ username: devClean });
    if (!devUser) {
      const devPassPlain = process.env.DEV_PASSWORD || 'devpass123';
      const devPassHash = hashPassword(devPassPlain);
      
      await new User({
        username: devClean,
        password: devPassHash,
        role: 'developer',
        status: 'Active'
      }).save();

      if (creds.adminCredentials instanceof Map) {
        creds.adminCredentials.set(devClean, devPassHash);
      } else {
        creds.adminCredentials[devClean] = devPassHash;
      }
      creds.markModified('adminCredentials');
      await creds.save();

      console.log(`\n======================================================`);
      console.log(`[SEED] Created default Developer account:`);
      console.log(`Username: developer`);
      console.log(`Password: ${devPassPlain}`);
      console.log(`======================================================\n`);
    }

    // 5. Clean up outdated credentials from MongoDB User collection
    const allUsers = await User.find({});
    for (const u of allUsers) {
      const uClean = u.username.toLowerCase().trim();
      if (!activeUsernames.has(uClean)) {
        await User.deleteOne({ _id: u._id });
        console.log(`[Sync] Deleted outdated/removed User account: ${uClean}`);
      }
    }
  } catch (err) {
    console.error('Error during User synchronization:', err);
  }
}

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
      if (pass && !pass.startsWith('pbkdf2:') && !pass.includes(':')) {
        console.log(`Migrating plaintext password for admin: ${user}`);
        setValue(creds.adminCredentials, user, hashPassword(pass));
        updated = true;
      }
    }

    // 2. Branch Credentials
    const branchEntries = getEntries(creds.branchCredentials);
    for (const [br, info] of branchEntries) {
      if (info && info.password && !info.password.startsWith('pbkdf2:') && !info.password.includes(':')) {
        console.log(`Migrating plaintext password for branch coordinator: ${br}`);
        const newInfo = { ...info, password: hashPassword(info.password) };
        setValue(creds.branchCredentials, br, newInfo);
        updated = true;
      }
    }

    // 3. Batch Credentials
    const batchEntries = getEntries(creds.batchCredentials);
    for (const [bt, info] of batchEntries) {
      if (info && info.password && !info.password.startsWith('pbkdf2:') && !info.password.includes(':')) {
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
      console.log('Plaintext passwords successfully migrated to secure hashes in MongoDB.');
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

// Load system settings cache from MongoDB
async function loadSettingsCache() {
  try {
    let settings = await SystemSetting.findOne({ configKey: 'main' });
    if (!settings) {
      settings = await new SystemSetting({ configKey: 'main' }).save();
    }
    cachedSettings = settings.toObject();
    console.log('[Settings Cache] Loaded from database:', cachedSettings);
  } catch (err) {
    console.error('[Settings Cache] Failed to load settings:', err);
  }
}

// Connect to MongoDB Atlas (Sanitize printed URI log for security)
const sanitizedMongoUri = (process.env.MONGO_URI || '').replace(/:([^:@]+)@/, ': [REDACTED] @');
console.log('Connecting to MongoDB URI:', sanitizedMongoUri);
mongoose.connect(process.env.MONGO_URI, { 
  dbName: 'attendance',
  maxPoolSize: 5
})
  .then(async () => {
    console.log('Successfully connected to MongoDB Atlas');
    await loadSettingsCache();
    await migratePlaintextPasswords();
    await migrateDefaultRates();
    await syncUsersAndSeed();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Routes

// 1. Get all students (excl. photo for memory optimization, scoped by user permissions)
app.get('/api/students', authenticateSession, async (req, res) => {
  try {
    const { role, branch, batch } = req.user;
    let filter = {};
    if (role !== 'superadmin' && role !== 'developer') {
      filter.branch = new RegExp(`^${branch}$`, 'i');
    }
    if (role === 'coordinator') {
      const schedule = await getBatchSchedule(batch);
      if (schedule) {
        filter.schedule = schedule;
      }
    }
    const students = await Student.find(filter).select('-photo').lean();
    res.json(students.map(decryptStudent));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1.1. Get student photo by ID (on-demand, scoped by user permissions)
app.get('/api/students/:id/photo', authenticateSession, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, branch, batch } = req.user;
    let filter = { id: Number(id) };
    if (role !== 'superadmin' && role !== 'developer') {
      filter.branch = new RegExp(`^${branch}$`, 'i');
    }
    if (role === 'coordinator') {
      const schedule = await getBatchSchedule(batch);
      if (schedule) {
        filter.schedule = schedule;
      }
    }
    const student = await Student.findOne(filter).select('photo').lean();
    if (!student) return res.status(404).json({ error: 'Student not found or unauthorized' });
    res.json({ photo: decrypt(student.photo) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Create student (scoped validation)
app.post('/api/students', authenticateSession, async (req, res) => {
  try {
    const { role, branch } = req.user;
    
    // Validate request body branch
    if (role !== 'superadmin' && role !== 'developer') {
      if (!req.body.branch || String(req.body.branch).toLowerCase().trim() !== branch.toLowerCase().trim()) {
        return res.status(403).json({ error: 'Unauthorized: cannot enroll student in another branch' });
      }
    }

    // Input Validation
    if (!req.body.name || typeof req.body.name !== 'string' || !req.body.name.trim()) {
      return res.status(400).json({ error: 'Valid student name is required' });
    }
    if (req.body.age === undefined || isNaN(Number(req.body.age))) {
      return res.status(400).json({ error: 'Valid student age is required' });
    }
    if (!req.body.phone || typeof req.body.phone !== 'string' || !req.body.phone.trim()) {
      return res.status(400).json({ error: 'Valid phone number is required' });
    }

    const encryptedBody = encryptStudentData(req.body);
    const newStudent = new Student(encryptedBody);
    const saved = await newStudent.save();
    res.status(201).json(decryptStudent(saved));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. Update student (scoped verification)
app.put('/api/students/:id', authenticateSession, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, branch } = req.user;
    
    const student = await Student.findOne({ id: Number(id) });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    
    if (role !== 'superadmin' && role !== 'developer') {
      if (student.branch.toLowerCase().trim() !== branch.toLowerCase().trim()) {
        return res.status(403).json({ error: 'Unauthorized: cannot modify student in another branch' });
      }
      if (req.body.branch && String(req.body.branch).toLowerCase().trim() !== branch.toLowerCase().trim()) {
        return res.status(403).json({ error: 'Unauthorized: cannot move student to another branch' });
      }
    }

    // Input Validation
    if (req.body.name !== undefined && (typeof req.body.name !== 'string' || !req.body.name.trim())) {
      return res.status(400).json({ error: 'Student name must be a non-empty string' });
    }

    const encryptedBody = encryptStudentData(req.body);
    const updated = await Student.findOneAndUpdate({ id: Number(id) }, encryptedBody, { new: true });
    res.json(decryptStudent(updated));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. Delete student (scoped verification)
app.delete('/api/students/:id', authenticateSession, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, branch } = req.user;
    
    const student = await Student.findOne({ id: Number(id) });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    
    if (role !== 'superadmin' && role !== 'developer') {
      if (student.branch.toLowerCase().trim() !== branch.toLowerCase().trim()) {
        return res.status(403).json({ error: 'Unauthorized to delete student in another branch' });
      }
    }

    await Student.findOneAndDelete({ id: Number(id) });
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get all attendance records (current year by default for optimization, scoped by branch/batch)
app.get('/api/attendance', authenticateSession, async (req, res) => {
  try {
    const { role, branch, batch } = req.user;
    
    const currentYear = new Date().getFullYear();
    let queryYear = currentYear;
    if (req.query.year) {
      const parsedYear = parseInt(req.query.year, 10);
      if (!isNaN(parsedYear)) queryYear = parsedYear;
    }
    
    const records = await Attendance.find({
      date: { $gte: `${queryYear}-01-01`, $lte: `${queryYear}-12-31` }
    }).lean();
    
    let allowedStudentIds = null;
    if (role !== 'superadmin' && role !== 'developer') {
      let studentFilter = { branch: new RegExp(`^${branch}$`, 'i') };
      if (role === 'coordinator') {
        const schedule = await getBatchSchedule(batch);
        if (schedule) {
          studentFilter.schedule = schedule;
        }
      }
      const students = await Student.find(studentFilter).select('id').lean();
      allowedStudentIds = new Set(students.map(s => String(s.id)));
    }
    
    const attendanceMap = {};
    records.forEach(record => {
      const plainRecords = record.records instanceof Map ? Object.fromEntries(record.records) : record.records;
      const decryptedRecords = decryptAttendanceRecords(plainRecords);
      
      let filteredRecords = decryptedRecords;
      if (allowedStudentIds) {
        filteredRecords = {};
        Object.keys(decryptedRecords).forEach(studentId => {
          if (allowedStudentIds.has(studentId)) {
            filteredRecords[studentId] = decryptedRecords[studentId];
          }
        });
      }
      
      attendanceMap[record.date] = filteredRecords;
    });
    res.json(attendanceMap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Save daily attendance (merged securely by branch/batch scope to prevent overwriting other branch records)
app.post('/api/attendance', authenticateSession, async (req, res) => {
  try {
    const { date, records } = req.body;
    if (!date) return res.status(400).json({ error: 'Date is required' });
    if (!records || typeof records !== 'object') {
      return res.status(400).json({ error: 'Records map is required' });
    }
    
    const { role, branch, batch } = req.user;
    
    let studentFilter = {};
    if (role !== 'superadmin' && role !== 'developer') {
      studentFilter.branch = new RegExp(`^${branch}$`, 'i');
      if (role === 'coordinator') {
        const schedule = await getBatchSchedule(batch);
        if (schedule) {
          studentFilter.schedule = schedule;
        }
      }
    }
    
    let attendanceDoc = await Attendance.findOne({ date });
    if (!attendanceDoc) {
      attendanceDoc = new Attendance({ date, records: {} });
    }

    const existingPlainRecords = attendanceDoc.records instanceof Map 
      ? Object.fromEntries(attendanceDoc.records) 
      : attendanceDoc.records;
    const decryptedExisting = decryptAttendanceRecords(existingPlainRecords);
    
    const finalDecryptedRecords = { ...decryptedExisting };

    if (role === 'superadmin' || role === 'developer') {
      Object.keys(records).forEach(studentId => {
        finalDecryptedRecords[studentId] = records[studentId];
      });
    } else {
      const allowedStudents = await Student.find(studentFilter).select('id').lean();
      const allowedIds = new Set(allowedStudents.map(s => String(s.id)));

      allowedIds.forEach(idStr => {
        if (records[idStr] !== undefined && records[idStr] !== null && records[idStr] !== 'none') {
          finalDecryptedRecords[idStr] = records[idStr];
        } else {
          delete finalDecryptedRecords[idStr];
        }
      });
    }

    const encryptedRecords = encryptAttendanceRecords(finalDecryptedRecords);
    
    attendanceDoc.records = new Map(Object.entries(encryptedRecords));
    attendanceDoc.markModified('records');
    
    const saved = await attendanceDoc.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 7. Login validation (linked to User model authentication & audits)
app.post('/api/login', async (req, res) => {
  try {
    const { loginType, username, password, branch, batch, deviceName, screenResolution } = req.body;
    
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Username and password must be strings' });
    }

    const enteredUser = username.toLowerCase().trim();
    const clientIp = getClientIp(req);
    const userAgent = req.headers['user-agent'] || '';
    const deviceDetails = parseUserAgent(userAgent);
    const resolution = screenResolution || 'Unknown';

    // --- ENFORCE MAINTENANCE MODE ON LOGIN ---
    if (cachedSettings.maintenanceMode && enteredUser !== 'developer') {
      return res.status(503).json({ success: false, error: 'System is under maintenance. Login is currently locked.' });
    }

    const user = await User.findOne({ username: enteredUser });

    // --- ENFORCE ACCOUNT LOCKED STATE ---
    if (user && user.isLocked) {
      return res.status(423).json({ success: false, error: 'Your account is locked due to security limits. Please contact the administrator.' });
    }

    // --- BRUTE FORCE LOCKOUT GUARD ---
    const blockTimeMs = (cachedSettings.failedLoginBlockTimeMinutes || 15) * 60 * 1000;
    const failedCount = await SecurityLog.countDocuments({
      eventType: 'FailedLogin',
      username: enteredUser,
      createdAt: { $gte: new Date(Date.now() - blockTimeMs) }
    });
    if (failedCount >= (cachedSettings.failedLoginThreshold || 5) && enteredUser !== 'developer') {
      if (user && !user.isLocked) {
        user.isLocked = true;
        await user.save();
      }
      return res.status(429).json({
        success: false,
        error: `Too many failed login attempts. Account is locked. Please try again in ${cachedSettings.failedLoginBlockTimeMinutes} minutes.`
      });
    }

    if (!user) {
      await new LoginHistory({
        username: enteredUser,
        status: 'Failed',
        ipAddress: clientIp,
        userAgent,
        deviceName: deviceName || 'Unknown Device',
        ...deviceDetails,
        screenResolution: resolution
      }).save();

      await new SecurityLog({
        eventType: 'FailedLogin',
        username: enteredUser,
        description: `Failed login attempt: account username not found.`,
        ipAddress: clientIp,
        userAgent
      }).save();

      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    if (user.status === 'Disabled') {
      return res.status(403).json({ success: false, error: 'Your account has been disabled by the administrator.' });
    }
    if (user.status === 'SoftDeleted') {
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    if (verifyPassword(password, user.password)) {
      const isSuper = loginType === 'superadmin' && (user.role === 'superadmin' || user.role === 'developer');
      const isCoord = loginType === 'coordinator' && (user.role === 'branchadmin' || user.role === 'coordinator');

      if (!isSuper && !isCoord) {
        // Log unauthorized type attempts
        await new LoginHistory({
          username: user.username,
          status: 'Failed',
          ipAddress: clientIp,
          userAgent,
          deviceName: deviceName || 'Unknown Device',
          ...deviceDetails,
          screenResolution: resolution
        }).save();
        return res.status(401).json({ success: false, error: 'Unauthorized login type for this account' });
      }

      const token = crypto.randomBytes(32).toString('hex');
      await new Session({
        username: user.username,
        token,
        ipAddress: clientIp,
        userAgent,
        deviceName: deviceName || 'Unknown Device',
        ...deviceDetails,
        screenResolution: resolution
      }).save();

      await new LoginHistory({
        username: user.username,
        status: 'Success',
        ipAddress: clientIp,
        userAgent,
        deviceName: deviceName || 'Unknown Device',
        sessionToken: token,
        ...deviceDetails,
        screenResolution: resolution
      }).save();

      // Update User stats
      user.lastLoginAt = new Date();
      user.loginCount = (user.loginCount || 0) + 1;
      user.failedAttempts = 0;
      user.failedLoginCount = 0;
      user.isLocked = false;
      await user.save();

      return res.json({ success: true, username: user.username, token, role: user.role, branch: user.branch, batch: user.batch });
    }

    // Password verification failed
    user.failedAttempts = (user.failedAttempts || 0) + 1;
    user.failedLoginCount = (user.failedLoginCount || 0) + 1;
    if (user.failedAttempts >= (cachedSettings.failedLoginThreshold || 5) && user.role !== 'developer') {
      user.isLocked = true;
    }
    await user.save();

    await new LoginHistory({
      username: user.username,
      status: 'Failed',
      ipAddress: clientIp,
      userAgent,
      deviceName: deviceName || 'Unknown Device',
      ...deviceDetails,
      screenResolution: resolution
    }).save();

    await new SecurityLog({
      eventType: 'FailedLogin',
      username: user.username,
      description: `Failed login attempt: invalid password.`,
      ipAddress: clientIp,
      userAgent
    }).save();

    if (user.isLocked) {
      return res.status(423).json({ success: false, error: 'Too many failed password attempts. Your account has been locked.' });
    }

    return res.status(401).json({ success: false, error: 'Invalid username or password' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Session verification endpoint (safe string token parse)
app.get('/api/session/verify', async (req, res) => {
  try {
    let { token } = req.query;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, error: 'Token is required and must be a string' });
    }
    
    token = String(token).trim();
    
    const session = await Session.findOne({ token }).lean();
    if (session) {
      // Validate user status
      const user = await User.findOne({ username: session.username }).lean();
      if (user && user.status === 'Active') {
        return res.json({ success: true, username: session.username, role: user.role, branch: user.branch, batch: user.batch });
      }
    }
    return res.status(401).json({ success: false, error: 'Session expired, disabled, or invalid' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout endpoint
app.post('/api/logout', async (req, res) => {
  try {
    let { token } = req.body;
    if (token && typeof token === 'string') {
      token = String(token).trim();
      const session = await Session.findOne({ token });
      if (session) {
        const logoutAt = new Date();
        const duration = Math.round((logoutAt.getTime() - new Date(session.loginTime).getTime()) / 1000);
        
        // Update User lastLogoutAt
        await User.updateOne(
          { username: session.username },
          { lastLogoutAt: logoutAt }
        );

        // Update corresponding LoginHistory record
        await LoginHistory.updateOne(
          { sessionToken: token, status: 'Success' },
          { logoutAt, sessionDuration: duration }
        );

        await Session.deleteOne({ token });
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all active sessions (Super Admin only, limit count to 100 to prevent out of memory)
app.get('/api/sessions', authenticateSession, authorizeRoles('superadmin'), async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'developer') {
      const developers = await User.find({ role: 'developer' }).select('username').lean();
      const devUsernames = developers.map(d => d.username.toLowerCase().trim());
      if (!devUsernames.includes('developer')) {
        devUsernames.push('developer');
      }
      query = { username: { $nin: devUsernames } };
    }
    const sessions = await Session.find(query).sort({ loginTime: -1 }).limit(100).lean();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Terminate all sessions (Super Admin only)
app.delete('/api/sessions', authenticateSession, authorizeRoles('superadmin'), async (req, res) => {
  try {
    let { except } = req.query;
    const filter = except && typeof except === 'string' ? { token: { $ne: String(except).trim() } } : {};
    
    if (req.user.role !== 'developer') {
      const developers = await User.find({ role: 'developer' }).select('username').lean();
      const devUsernames = developers.map(d => d.username.toLowerCase().trim());
      if (!devUsernames.includes('developer')) {
        devUsernames.push('developer');
      }
      filter.username = { $nin: devUsernames };
    }
    
    const result = await Session.deleteMany(filter);
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Terminate/Force Logout a session (Super Admin only)
app.delete('/api/sessions/:token', authenticateSession, authorizeRoles('superadmin'), async (req, res) => {
  try {
    let { token } = req.params;
    if (token && typeof token === 'string') {
      token = String(token).trim();
      const session = await Session.findOne({ token }).lean();
      if (session) {
        const targetUser = await User.findOne({ username: session.username.toLowerCase().trim() }).lean();
        const isDeveloper = (targetUser && targetUser.role === 'developer') || session.username.toLowerCase().trim() === 'developer';
        if (isDeveloper && req.user.role !== 'developer') {
          return res.status(403).json({ error: 'Access denied: insufficient permissions to terminate developer session' });
        }
        await Session.deleteOne({ token });
      }
    }
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
    if (!username || !phone || typeof username !== 'string' || typeof phone !== 'string') {
      return res.status(400).json({ success: false, error: 'Username and phone number are required strings' });
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
    console.log(`[OTP SERVICE] Sent OTP to 9633380198 for user '${enteredUser}'`);
    console.log(`======================================================\n`);

    const sentReal = await sendOTPMedia(phone, otp);
    const responseData = { success: true };
    if (!sentReal) {
      responseData.message = 'OTP logged to server console';
      if (process.env.NODE_ENV !== 'production') {
        responseData.debugOtp = otp;
      }
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
    if (!username || !otp || typeof username !== 'string' || typeof otp !== 'string') {
      return res.status(400).json({ success: false, error: 'Username and OTP are required strings' });
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
    if (!username || !otp || !newPassword || typeof username !== 'string' || typeof otp !== 'string' || typeof newPassword !== 'string') {
      return res.status(400).json({ success: false, error: 'Username, OTP, and new password are required strings' });
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

    // --- ENFORCE PASSWORD LENGTH ---
    if (newPassword.length < (cachedSettings.minPasswordLength || 6)) {
      return res.status(400).json({ success: false, error: `Password must be at least ${cachedSettings.minPasswordLength || 6} characters long.` });
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
    await syncUsersAndSeed();

    delete otpStore[enteredUser];

    console.log(`[OTP SERVICE] Password reset completed successfully for admin user: ${enteredUser}`);
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get raw credentials (unmasked database values - Super Admin only)
app.get('/api/credentials/raw', authenticateSession, authorizeRoles('superadmin'), async (req, res) => {
  try {
    const creds = await Credential.findOne({ configType: 'main' }).lean();
    if (!creds) {
      return res.json({ configType: 'main', adminCredentials: {}, branchCredentials: {}, batchCredentials: {} });
    }
    const safeCreds = JSON.parse(JSON.stringify(creds));
    if (req.user.role !== 'developer' && safeCreds.adminCredentials) {
      const developers = await User.find({ role: 'developer' }).select('username').lean();
      const devUsernames = developers.map(d => d.username.toLowerCase().trim());
      if (!devUsernames.includes('developer')) {
        devUsernames.push('developer');
      }
      for (const devUser of devUsernames) {
        delete safeCreds.adminCredentials[devUser];
      }
    }
    res.json(safeCreds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get credentials (passwords masked for security - Super Admin and Developer)
app.get('/api/credentials', authenticateSession, authorizeRoles('superadmin', 'developer'), async (req, res) => {
  try {
    const creds = await Credential.findOne({ configType: 'main' }).lean();
    if (!creds) {
      return res.json({ configType: 'main', adminCredentials: {}, branchCredentials: {}, batchCredentials: {} });
    }
    
    const safeCreds = JSON.parse(JSON.stringify(creds));
    if (req.user.role !== 'developer' && safeCreds.adminCredentials) {
      const developers = await User.find({ role: 'developer' }).select('username').lean();
      const devUsernames = developers.map(d => d.username.toLowerCase().trim());
      if (!devUsernames.includes('developer')) {
        devUsernames.push('developer');
      }
      for (const devUser of devUsernames) {
        delete safeCreds.adminCredentials[devUser];
      }
    }
    
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

// Update credentials (auto-hashes new passwords - Super Admin only)
app.put('/api/credentials', authenticateSession, authorizeRoles('superadmin'), async (req, res) => {
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
          const oldHash = credsDoc.adminCredentials instanceof Map 
            ? credsDoc.adminCredentials.get(user) 
            : credsDoc.adminCredentials[user];
          body.adminCredentials[user] = oldHash;
        } else if (pass) {
          // --- ENFORCE PASSWORD LENGTH ---
          if (pass.length < (cachedSettings.minPasswordLength || 6)) {
            return res.status(400).json({ error: `Admin password must be at least ${cachedSettings.minPasswordLength || 6} characters.` });
          }
          if (!String(pass).startsWith('pbkdf2:')) {
            body.adminCredentials[user] = hashPassword(pass);
          }
        }
      }
      
      const developers = await User.find({ role: 'developer' }).select('username').lean();
      const devUsernames = developers.map(d => d.username.toLowerCase().trim());
      if (!devUsernames.includes('developer')) {
        devUsernames.push('developer');
      }

      const bodyKeys = Object.keys(body.adminCredentials);
      for (const key of Array.from(credsDoc.adminCredentials.keys())) {
        const keyClean = key.toLowerCase().trim();
        if (devUsernames.includes(keyClean) && req.user.role !== 'developer') {
          continue; // Preserve developer account
        }
        if (!bodyKeys.includes(key)) {
          credsDoc.adminCredentials.delete(key);
        }
      }
      for (const [user, pass] of Object.entries(body.adminCredentials)) {
        const userClean = user.toLowerCase().trim();
        if (devUsernames.includes(userClean) && req.user.role !== 'developer') {
          continue; // Block non-developers from modifying developer
        }
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
          } else {
            // --- ENFORCE PASSWORD LENGTH ---
            if (creds.password.length < (cachedSettings.minPasswordLength || 6)) {
              return res.status(400).json({ error: `Branch password must be at least ${cachedSettings.minPasswordLength || 6} characters.` });
            }
            if (!String(creds.password).startsWith('pbkdf2:')) {
              creds.password = hashPassword(creds.password);
            }
          }
        }
      }

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
          } else {
            // --- ENFORCE PASSWORD LENGTH ---
            if (creds.password.length < (cachedSettings.minPasswordLength || 6)) {
              return res.status(400).json({ error: `Batch password must be at least ${cachedSettings.minPasswordLength || 6} characters.` });
            }
            if (!String(creds.password).startsWith('pbkdf2:')) {
              creds.password = hashPassword(creds.password);
            }
          }
        }
      }

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
    
    // Automatically synchronize user collection
    await syncUsersAndSeed();
    
    res.json(credsDoc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// ==========================================
// --- PROTECTED DEVELOPER API ROUTER ---
// ==========================================

const developerRouter = express.Router();
developerRouter.use(authenticateSession);
developerRouter.use(authorizeDeveloper);

// 1. User Management - View Users (paginated and searchable)
developerRouter.get('/users', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const search = String(req.query.search || '').trim();
    
    const query = {};
    if (search) {
      query.username = new RegExp(search, 'i');
    }
    
    const count = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
      
    res.json({
      users,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch detailed consolidated user profile metrics
developerRouter.get('/users/:id/details', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Fetch Login History
    const loginHistory = await LoginHistory.find({ username: user.username })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Fetch Device History (distinct device metrics)
    const devices = await LoginHistory.aggregate([
      { $match: { username: user.username } },
      { $group: {
          _id: {
            deviceName: '$deviceName',
            deviceType: '$deviceType',
            osName: '$osName',
            osVersion: '$osVersion',
            browserName: '$browserName',
            browserVersion: '$browserVersion',
            screenResolution: '$screenResolution'
          },
          lastUsed: { $max: '$createdAt' }
      }},
      { $sort: { lastUsed: -1 } }
    ]);

    // Fetch IP History
    const ips = await LoginHistory.aggregate([
      { $match: { username: user.username } },
      { $group: {
          _id: '$ipAddress',
          count: { $sum: 1 },
          lastUsed: { $max: '$createdAt' }
      }},
      { $sort: { lastUsed: -1 } }
    ]);

    // Fetch Security / Audit logs
    const securityLogs = await SecurityLog.find({ username: user.username })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    // Fetch Student data (if matched to student)
    let student = null;
    let attendanceSummary = { present: 0, absent: 0, total: 0 };
    let feeSummary = { totalPaid: 0, payments: [] };

    student = await Student.findOne({
      $or: [
        { email: user.email },
        { phone: user.phone },
        { name: user.fullName }
      ]
    }).lean();

    if (student) {
      // Calculate attendance
      const attendance = await Attendance.find({ 'records.studentId': student.id }).lean();
      let present = 0;
      let absent = 0;
      for (const record of attendance) {
        const studentRec = record.records.find(r => r.studentId === student.id);
        if (studentRec) {
          if (studentRec.status === 'Present') present++;
          else if (studentRec.status === 'Absent') absent++;
        }
      }
      attendanceSummary = { present, absent, total: present + absent };

      // Calculate fees
      feeSummary = {
        totalPaid: (student.payments || []).reduce((acc, curr) => acc + (curr.amount || 0), 0),
        payments: student.payments || []
      };
    }

    res.json({
      user,
      loginHistory,
      devices: devices.map(d => ({ ...d._id, lastUsed: d.lastUsed })),
      ips: ips.map(i => ({ ip: i._id, count: i.count, lastUsed: i.lastUsed })),
      securityLogs,
      student,
      attendanceSummary,
      feeSummary
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit user (change username, email, role, status)
developerRouter.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, status } = req.body;
    
    const userToEdit = await User.findById(id);
    if (!userToEdit) {
      return res.status(404).json({ error: 'User not found' });
    }

    const modifierUsername = req.user.username;
    let auditDesc = `Updated user ${userToEdit.username}: `;
    
    const oldUsername = userToEdit.username;
    const oldRole = userToEdit.role;
    const oldBranch = userToEdit.branch;
    const oldBatch = userToEdit.batch;
    let changed = false;

    if (username && username.toLowerCase().trim() !== userToEdit.username) {
      const uClean = username.toLowerCase().trim();
      const duplicate = await User.findOne({ username: uClean });
      if (duplicate) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      auditDesc += `username changed to ${uClean}; `;
      userToEdit.username = uClean;
      changed = true;
    }
    
    if (email !== undefined && email !== userToEdit.email) {
      auditDesc += `email changed to ${email}; `;
      userToEdit.email = email;
      changed = true;
    }
    
    if (role && role !== userToEdit.role) {
      auditDesc += `role changed to ${role}; `;
      userToEdit.role = role;
      changed = true;
      
      await new SecurityLog({
        eventType: 'RoleChange',
        username: modifierUsername,
        description: `Role of user ${userToEdit.username} changed to ${role}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      }).save();
    }
    
    if (status && status !== userToEdit.status) {
      auditDesc += `status changed to ${status}; `;
      userToEdit.status = status;
      changed = true;
      
      await new SecurityLog({
        eventType: 'UserStatusUpdate',
        username: modifierUsername,
        description: `Status of user ${userToEdit.username} changed to ${status}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      }).save();
    }

    if (changed) {
      await userToEdit.save();

      // Sync to Credential model
      const creds = await Credential.findOne({ configType: 'main' });
      if (creds) {
        let password = userToEdit.password;
        
        // Remove from old place in creds
        if (oldRole === 'superadmin' || oldRole === 'developer') {
          if (creds.adminCredentials instanceof Map) {
            password = creds.adminCredentials.get(oldUsername) || password;
            creds.adminCredentials.delete(oldUsername);
          } else {
            password = creds.adminCredentials[oldUsername] || password;
            delete creds.adminCredentials[oldUsername];
          }
        } else if (oldRole === 'branchadmin') {
          const key = oldBranch;
          if (key) {
            const entry = creds.branchCredentials instanceof Map ? creds.branchCredentials.get(key) : creds.branchCredentials[key];
            if (entry) {
              password = entry.password || password;
              if (creds.branchCredentials instanceof Map) {
                creds.branchCredentials.delete(key);
              } else {
                delete creds.branchCredentials[key];
              }
            }
          }
        } else if (oldRole === 'coordinator') {
          const key = `${oldBranch}_${oldBatch}`;
          const entry = creds.batchCredentials instanceof Map ? creds.batchCredentials.get(key) : creds.batchCredentials[key];
          if (entry) {
            password = entry.password || password;
            if (creds.batchCredentials instanceof Map) {
              creds.batchCredentials.delete(key);
            } else {
              delete creds.batchCredentials[key];
            }
          }
        }

        // Add to new place in creds if not soft-deleted
        if (userToEdit.status !== 'SoftDeleted') {
          const newUsername = userToEdit.username;
          const newRole = userToEdit.role;
          const newBranch = userToEdit.branch || oldBranch || 'Kuttiady';
          const newBatch = userToEdit.batch || oldBatch || 'batch1';

          if (newRole === 'superadmin' || newRole === 'developer') {
            if (creds.adminCredentials instanceof Map) {
              creds.adminCredentials.set(newUsername, password);
            } else {
              creds.adminCredentials[newUsername] = password;
            }
          } else if (newRole === 'branchadmin') {
            const key = newBranch;
            const newEntry = { username: newUsername, password };
            if (creds.branchCredentials instanceof Map) {
              creds.branchCredentials.set(key, newEntry);
            } else {
              creds.branchCredentials[key] = newEntry;
            }
          } else if (newRole === 'coordinator') {
            const key = `${newBranch}_${newBatch}`;
            const newEntry = { username: newUsername, password };
            if (creds.batchCredentials instanceof Map) {
              creds.batchCredentials.set(key, newEntry);
            } else {
              creds.batchCredentials[key] = newEntry;
            }
          }
        }

        creds.markModified('adminCredentials');
        creds.markModified('branchCredentials');
        creds.markModified('batchCredentials');
        await creds.save();
      }

      await new SecurityLog({
        eventType: 'DeveloperAudit',
        username: modifierUsername,
        description: auditDesc,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      }).save();
    }

    res.json(userToEdit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Lock/Unlock account
developerRouter.put('/users/:id/lock', async (req, res) => {
  try {
    const { id } = req.params;
    const { isLocked } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.isLocked = !!isLocked;
    if (!isLocked) {
      user.failedAttempts = 0;
      user.failedLoginCount = 0;
    }
    await user.save();

    await new SecurityLog({
      eventType: 'DeveloperAudit',
      username: req.user.username,
      description: `${isLocked ? 'Locked' : 'Unlocked'} user account: ${user.username}`,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent']
    }).save();

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enable/Disable user status
developerRouter.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['Active', 'Disabled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.status = status;
    await user.save();

    await new SecurityLog({
      eventType: 'DeveloperAudit',
      username: req.user.username,
      description: `${status === 'Active' ? 'Enabled' : 'Disabled'} user account: ${user.username}`,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent']
    }).save();

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Force Password Reset
developerRouter.put('/users/:id/reset-password', async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < (cachedSettings.minPasswordLength || 6)) {
      return res.status(400).json({ error: `Password must be at least ${cachedSettings.minPasswordLength || 6} characters.` });
    }
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.password = hashPassword(newPassword);
    user.passwordChangedAt = new Date();
    await user.save();

    // Sync to credentials config map
    const creds = await Credential.findOne({ configType: 'main' });
    if (creds) {
      if (user.role === 'superadmin' || user.role === 'developer') {
        if (creds.adminCredentials instanceof Map) {
          creds.adminCredentials.set(user.username, newPassword);
        } else {
          creds.adminCredentials[user.username] = newPassword;
        }
      } else if (user.role === 'branchadmin') {
        const key = user.branch;
        if (key) {
          const entry = creds.branchCredentials instanceof Map ? creds.branchCredentials.get(key) : creds.branchCredentials[key];
          if (entry) {
            entry.password = newPassword;
          } else {
            const newEntry = { username: user.username, password: newPassword };
            if (creds.branchCredentials instanceof Map) {
              creds.branchCredentials.set(key, newEntry);
            } else {
              creds.branchCredentials[key] = newEntry;
            }
          }
        }
      } else if (user.role === 'coordinator') {
        const key = `${user.branch}_${user.batch}`;
        const entry = creds.batchCredentials instanceof Map ? creds.batchCredentials.get(key) : creds.batchCredentials[key];
        if (entry) {
          entry.password = newPassword;
        } else {
          const newEntry = { username: user.username, password: newPassword };
          if (creds.batchCredentials instanceof Map) {
            creds.batchCredentials.set(key, newEntry);
          } else {
            creds.batchCredentials[key] = newEntry;
          }
        }
      }
      creds.markModified('adminCredentials');
      creds.markModified('branchCredentials');
      creds.markModified('batchCredentials');
      await creds.save();
    }

    await new SecurityLog({
      eventType: 'DeveloperAudit',
      username: req.user.username,
      description: `Reset password for user account: ${user.username}`,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent']
    }).save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Soft Delete User
developerRouter.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userToEdit = await User.findById(id);
    if (!userToEdit) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    userToEdit.status = 'SoftDeleted';
    await userToEdit.save();
    
    // Sync to Credential model by removing the user entry
    const creds = await Credential.findOne({ configType: 'main' });
    if (creds) {
      const uName = userToEdit.username;
      const uRole = userToEdit.role;
      const uBranch = userToEdit.branch;
      const uBatch = userToEdit.batch;
      
      if (uRole === 'superadmin' || uRole === 'developer') {
        if (creds.adminCredentials instanceof Map) {
          creds.adminCredentials.delete(uName);
        } else {
          delete creds.adminCredentials[uName];
        }
      } else if (uRole === 'branchadmin') {
        const key = uBranch;
        if (key) {
          if (creds.branchCredentials instanceof Map) {
            creds.branchCredentials.delete(key);
          } else {
            delete creds.branchCredentials[key];
          }
        }
      } else if (uRole === 'coordinator') {
        const key = `${uBranch}_${uBatch}`;
        if (creds.batchCredentials instanceof Map) {
          creds.batchCredentials.delete(key);
        } else {
          delete creds.batchCredentials[key];
        }
      }
      
      creds.markModified('adminCredentials');
      creds.markModified('branchCredentials');
      creds.markModified('batchCredentials');
      await creds.save();
    }

    await new SecurityLog({
      eventType: 'UserStatusUpdate',
      username: req.user.username,
      description: `Soft-deleted user ${userToEdit.username}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    }).save();
    
    res.json({ success: true, message: 'User soft-deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Session Management - View active sessions (paginated)
developerRouter.get('/sessions', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    
    const count = await Session.countDocuments();
    const sessions = await Session.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
      
    res.json({
      sessions,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout specific session
developerRouter.delete('/sessions/:token', async (req, res) => {
  try {
    const { token } = req.params;
    await Session.deleteOne({ token });
    
    await new SecurityLog({
      eventType: 'SessionTermination',
      username: req.user.username,
      description: `Terminated active session token.`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    }).save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout all sessions (except current)
developerRouter.delete('/sessions', async (req, res) => {
  try {
    const currentToken = req.user.token;
    const result = await Session.deleteMany({ token: { $ne: currentToken } });
    
    await new SecurityLog({
      eventType: 'SessionTermination',
      username: req.user.username,
      description: `Terminated all active sessions except current session (Deleted: ${result.deletedCount}).`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    }).save();

    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login history (paginated)
developerRouter.get('/login-history', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    
    const count = await LoginHistory.countDocuments();
    const history = await LoginHistory.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
      
    res.json({
      history,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. System Monitoring
developerRouter.get('/system-status', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    const activeUsersCount = await Session.distinct('username');
    const totalSessionsCount = await Session.countDocuments();
    
    const freeMemBytes = os.freemem();
    const totalMemBytes = os.totalmem();
    const processMem = process.memoryUsage();
    
    res.json({
      databaseStatus: dbStatus,
      activeUsers: activeUsersCount.length,
      totalSessions: totalSessionsCount,
      os: {
        platform: os.platform(),
        release: os.release(),
        uptime: os.uptime(),
        freeMemory: Math.round(freeMemBytes / (1024 * 1024)) + ' MB',
        totalMemory: Math.round(totalMemBytes / (1024 * 1024)) + ' MB',
        cpuUsage: os.loadavg()
      },
      process: {
        uptime: process.uptime(),
        memoryUsage: {
          rss: Math.round(processMem.rss / (1024 * 1024)) + ' MB',
          heapTotal: Math.round(processMem.heapTotal / (1024 * 1024)) + ' MB',
          heapUsed: Math.round(processMem.heapUsed / (1024 * 1024)) + ' MB'
        }
      },
      apiStatus: 'Healthy'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Security Center logs (paginated)
developerRouter.get('/security-logs', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    
    const count = await SecurityLog.countDocuments();
    const logs = await SecurityLog.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
      
    res.json({
      logs,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 5. Developer Tools - Application logs (Searchable, filterable, and paginated)
developerRouter.get('/app-logs', async (req, res) => {
  try {
    const { type, search, page = 1, limit = 50 } = req.query;
    let filtered = appLogs;
    
    if (type && type !== 'all') {
      filtered = filtered.filter(l => l.type === type);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(l => l.message.toLowerCase().includes(q));
    }
    
    const count = filtered.length;
    const p = Math.max(1, parseInt(page, 10));
    const lim = Math.min(100, Math.max(1, parseInt(limit, 10)));
    
    // Reverse chronological order
    const sorted = [...filtered].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const paginated = sorted.slice((p - 1) * lim, p * lim);
    
    res.json({
      logs: paginated,
      pagination: {
        page: p,
        limit: lim,
        totalItems: count,
        totalPages: Math.ceil(count / lim)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Database statistics (document count benchmarks)
developerRouter.get('/db-stats', async (req, res) => {
  try {
    const studentCount = await Student.countDocuments();
    const attendanceCount = await Attendance.countDocuments();
    const userCount = await User.countDocuments();
    const sessionCount = await Session.countDocuments();
    const loginHistoryCount = await LoginHistory.countDocuments();
    const securityLogCount = await SecurityLog.countDocuments();
    
    res.json({
      students: studentCount,
      attendance: attendanceCount,
      users: userCount,
      sessions: sessionCount,
      loginHistory: loginHistoryCount,
      securityLogs: securityLogCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard stats
developerRouter.get('/dashboard-stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = (await Session.distinct('username')).length;
    const totalSessions = await Session.countDocuments();
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    
    // Recent activity (audit logs)
    const recentActivity = await SecurityLog.find({ eventType: { $ne: 'FailedLogin' } })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
      
    // Security alerts (failed logins)
    const securityAlerts = await SecurityLog.find({ eventType: 'FailedLogin' })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
      
    const studentCount = await Student.countDocuments();
    const attendanceCount = await Attendance.countDocuments();
    const processMem = process.memoryUsage();
    
    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        sessions: totalSessions
      },
      database: {
        status: dbStatus,
        studentsCount: studentCount,
        attendanceCount: attendanceCount
      },
      system: {
        uptime: process.uptime(),
        memoryUsage: Math.round(processMem.heapUsed / (1024 * 1024)) + ' MB',
        health: 'Healthy'
      },
      recentActivity,
      securityAlerts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Full database stats, collection sizes, and indexes info
developerRouter.get('/database', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const stats = await db.command({ dbStats: 1 });
    
    const collections = ['students', 'attendances', 'credentials', 'sessions', 'users', 'loginhistories', 'securitylogs'];
    const collectionsData = [];
    
    const startPing = Date.now();
    await db.command({ ping: 1 });
    const pingLatencyMs = Date.now() - startPing;
    
    for (const collName of collections) {
      try {
        const collStats = await db.command({ collStats: collName });
        const indexes = await db.collection(collName).listIndexes().toArray();
        
        collectionsData.push({
          name: collName,
          count: collStats.count,
          size: Math.round(collStats.size / 1024) + ' KB',
          storageSize: Math.round(collStats.storageSize / 1024) + ' KB',
          avgObjSize: Math.round(collStats.avgObjSize) + ' bytes',
          indexCount: collStats.nindexes,
          indexSizes: collStats.indexSizes,
          indexes: indexes.map(idx => ({
            name: idx.name,
            key: idx.key,
            unique: !!idx.unique
          }))
        });
      } catch (collErr) {
        const count = await db.collection(collName).countDocuments();
        collectionsData.push({
          name: collName,
          count,
          size: 'N/A',
          storageSize: 'N/A',
          avgObjSize: 'N/A',
          indexCount: 0,
          indexSizes: {},
          indexes: []
        });
      }
    }
    
    res.json({
      databaseName: stats.db,
      collectionsCount: stats.collections,
      objectsCount: stats.objects,
      dataSize: Math.round(stats.dataSize / (1024 * 1024)) + ' MB',
      storageSize: Math.round(stats.storageSize / (1024 * 1024)) + ' MB',
      indexesCount: stats.indexes,
      indexSize: Math.round(stats.indexSize / (1024 * 1024)) + ' MB',
      pingLatencyMs,
      collections: collectionsData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Audit route (user updates, config changes)
developerRouter.get('/audit', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const eventType = req.query.eventType;
    
    const query = { eventType: { $ne: 'FailedLogin' } };
    if (eventType) {
      query.eventType = eventType;
    }
    
    const count = await SecurityLog.countDocuments(query);
    const logs = await SecurityLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
      
    res.json({
      logs,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Developer settings GET
developerRouter.get('/settings', (req, res) => {
  res.json(cachedSettings);
});

// Developer settings POST
developerRouter.post('/settings', async (req, res) => {
  try {
    const { maintenanceMode, sessionTimeoutMinutes, minPasswordLength, failedLoginThreshold, failedLoginBlockTimeMinutes, logRetentionLimit } = req.body;
    
    // Validate inputs
    if (sessionTimeoutMinutes !== undefined && (isNaN(sessionTimeoutMinutes) || sessionTimeoutMinutes <= 0)) {
      return res.status(400).json({ error: 'Session Timeout must be a positive number.' });
    }
    if (minPasswordLength !== undefined && (isNaN(minPasswordLength) || minPasswordLength < 4 || minPasswordLength > 32)) {
      return res.status(400).json({ error: 'Minimum password length must be between 4 and 32 characters.' });
    }
    if (failedLoginThreshold !== undefined && (isNaN(failedLoginThreshold) || failedLoginThreshold <= 0)) {
      return res.status(400).json({ error: 'Failed Login Threshold must be a positive number.' });
    }
    if (failedLoginBlockTimeMinutes !== undefined && (isNaN(failedLoginBlockTimeMinutes) || failedLoginBlockTimeMinutes <= 0)) {
      return res.status(400).json({ error: 'Failed Login Block Duration must be a positive number.' });
    }
    if (logRetentionLimit !== undefined && (isNaN(logRetentionLimit) || logRetentionLimit <= 0 || logRetentionLimit > 10000)) {
      return res.status(400).json({ error: 'Log retention limit must be a positive number up to 10,000.' });
    }

    let settings = await SystemSetting.findOne({ configKey: 'main' });
    if (!settings) {
      settings = new SystemSetting({ configKey: 'main' });
    }
    
    if (maintenanceMode !== undefined) settings.maintenanceMode = !!maintenanceMode;
    if (sessionTimeoutMinutes !== undefined) settings.sessionTimeoutMinutes = parseInt(sessionTimeoutMinutes, 10);
    if (minPasswordLength !== undefined) settings.minPasswordLength = parseInt(minPasswordLength, 10);
    if (failedLoginThreshold !== undefined) settings.failedLoginThreshold = parseInt(failedLoginThreshold, 10);
    if (failedLoginBlockTimeMinutes !== undefined) settings.failedLoginBlockTimeMinutes = parseInt(failedLoginBlockTimeMinutes, 10);
    if (logRetentionLimit !== undefined) settings.logRetentionLimit = parseInt(logRetentionLimit, 10);
    
    await settings.save();
    cachedSettings = settings.toObject();
    
    if (appLogs.length > cachedSettings.logRetentionLimit) {
      appLogs.splice(0, appLogs.length - cachedSettings.logRetentionLimit);
    }
    
    await new SecurityLog({
      eventType: 'SystemConfigUpdate',
      username: req.user.username,
      description: `Developer updated system configuration options in database.`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    }).save();
    
    res.json({ success: true, settings: cachedSettings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Users MongoDB CRUD APIs
app.get('/api/admins', authenticateSession, authorizeRoles('superadmin'), async (req, res) => {
  try {
    const admins = await User.find({
      role: { $in: ['superadmin', 'branchadmin', 'coordinator'] },
      status: { $ne: 'SoftDeleted' }
    }).lean();

    const enriched = [];
    for (const adm of admins) {
      const lastLoginLog = await LoginHistory.findOne({
        username: adm.username,
        status: 'Success'
      }).sort({ createdAt: -1 }).lean();

      enriched.push({
        ...adm,
        lastLoginLog: lastLoginLog || null
      });
    }

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admins', authenticateSession, authorizeRoles('superadmin'), async (req, res) => {
  try {
    const { username, password, role, branch, batch, fullName, phone, employeeId } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Username, password, and role are required' });
    }
    if (role === 'developer' && req.user.role !== 'developer') {
      return res.status(403).json({ error: 'Access denied: cannot create developer user' });
    }
    const cleanUser = username.toLowerCase().trim();
    const existing = await User.findOne({ username: cleanUser });
    if (existing) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = hashPassword(password);
    const newUser = new User({
      username: cleanUser,
      password: hashedPassword,
      role,
      branch: branch || '',
      batch: batch || '',
      fullName: fullName || '',
      phone: phone || '',
      employeeId: employeeId || '',
      status: 'Active',
      passwordChangedAt: new Date()
    });
    await newUser.save();

    // Sync to credentials config document
    const creds = await Credential.findOne({ configType: 'main' });
    if (creds) {
      if (role === 'superadmin') {
        if (creds.adminCredentials instanceof Map) {
          creds.adminCredentials.set(cleanUser, password);
        } else {
          creds.adminCredentials[cleanUser] = password;
        }
      } else if (role === 'branchadmin') {
        const key = branch || 'Kuttiady';
        const entry = { username: cleanUser, password };
        if (creds.branchCredentials instanceof Map) {
          creds.branchCredentials.set(key, entry);
        } else {
          creds.branchCredentials[key] = entry;
        }
      } else if (role === 'coordinator') {
        const key = `${branch || 'Kuttiady'}_${batch || 'batch1'}`;
        const entry = { username: cleanUser, password };
        if (creds.batchCredentials instanceof Map) {
          creds.batchCredentials.set(key, entry);
        } else {
          creds.batchCredentials[key] = entry;
        }
      }
      creds.markModified('adminCredentials');
      creds.markModified('branchCredentials');
      creds.markModified('batchCredentials');
      await creds.save();
    }

    await new SecurityLog({
      eventType: 'DeveloperAudit',
      username: req.user.username,
      description: `Created Admin account: ${cleanUser} (Role: ${role})`,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent']
    }).save();

    res.json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admins/:id', authenticateSession, authorizeRoles('superadmin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role, branch, batch, fullName, phone, employeeId, status, isLocked } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'Admin user not found' });

    if (user.role === 'developer' && req.user.role !== 'developer') {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }
    if (role === 'developer' && req.user.role !== 'developer') {
      return res.status(403).json({ error: 'Access denied: cannot assign developer role' });
    }

    const oldUsername = user.username;
    const oldRole = user.role;
    const oldBranch = user.branch;
    const oldBatch = user.batch;

    if (username && username.toLowerCase().trim() !== user.username) {
      const cleanUser = username.toLowerCase().trim();
      const duplicate = await User.findOne({ username: cleanUser });
      if (duplicate) return res.status(400).json({ error: 'Username already exists' });
      user.username = cleanUser;
    }

    if (password) {
      user.password = hashPassword(password);
      user.passwordChangedAt = new Date();
    }

    if (role) user.role = role;
    if (branch !== undefined) user.branch = branch;
    if (batch !== undefined) user.batch = batch;
    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (employeeId !== undefined) user.employeeId = employeeId;
    if (status) user.status = status;
    if (isLocked !== undefined) {
      user.isLocked = !!isLocked;
      if (!isLocked) {
        user.failedAttempts = 0;
        user.failedLoginCount = 0;
      }
    }

    await user.save();

    // Sync to credentials config document
    const creds = await Credential.findOne({ configType: 'main' });
    if (creds) {
      let plainPass = password;
      if (!plainPass) {
        if (oldRole === 'superadmin') {
          plainPass = creds.adminCredentials instanceof Map ? creds.adminCredentials.get(oldUsername) : creds.adminCredentials[oldUsername];
        } else if (oldRole === 'branchadmin') {
          const entry = creds.branchCredentials instanceof Map ? creds.branchCredentials.get(oldBranch) : creds.branchCredentials[oldBranch];
          plainPass = entry?.password;
        } else if (oldRole === 'coordinator') {
          const key = `${oldBranch}_${oldBatch}`;
          const entry = creds.batchCredentials instanceof Map ? creds.batchCredentials.get(key) : creds.batchCredentials[key];
          plainPass = entry?.password;
        }
      }
      if (!plainPass) plainPass = '123456';

      // Delete old mapping
      if (oldRole === 'superadmin') {
        if (creds.adminCredentials instanceof Map) creds.adminCredentials.delete(oldUsername);
        else delete creds.adminCredentials[oldUsername];
      } else if (oldRole === 'branchadmin') {
        if (creds.branchCredentials instanceof Map) creds.branchCredentials.delete(oldBranch);
        else delete creds.branchCredentials[oldBranch];
      } else if (oldRole === 'coordinator') {
        const key = `${oldBranch}_${oldBatch}`;
        if (creds.batchCredentials instanceof Map) creds.batchCredentials.delete(key);
        else delete creds.batchCredentials[key];
      }

      // Insert new mapping if status is not soft-deleted
      if (user.status !== 'SoftDeleted') {
        const newRole = user.role;
        const newUsername = user.username;
        const newBranch = user.branch || 'Kuttiady';
        const newBatch = user.batch || 'batch1';

        if (newRole === 'superadmin') {
          if (creds.adminCredentials instanceof Map) creds.adminCredentials.set(newUsername, plainPass);
          else creds.adminCredentials[newUsername] = plainPass;
        } else if (newRole === 'branchadmin') {
          const entry = { username: newUsername, password: plainPass };
          if (creds.branchCredentials instanceof Map) creds.branchCredentials.set(newBranch, entry);
          else creds.branchCredentials[newBranch] = entry;
        } else if (newRole === 'coordinator') {
          const key = `${newBranch}_${newBatch}`;
          const entry = { username: newUsername, password: plainPass };
          if (creds.batchCredentials instanceof Map) creds.batchCredentials.set(key, entry);
          else creds.batchCredentials[key] = entry;
        }
      }

      creds.markModified('adminCredentials');
      creds.markModified('branchCredentials');
      creds.markModified('batchCredentials');
      await creds.save();
    }

    await new SecurityLog({
      eventType: 'DeveloperAudit',
      username: req.user.username,
      description: `Updated Admin account: ${user.username}`,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent']
    }).save();

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admins/:id', authenticateSession, authorizeRoles('superadmin'), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'Admin user not found' });

    if (user.role === 'developer' && req.user.role !== 'developer') {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }

    user.status = 'SoftDeleted';
    await user.save();

    // Delete from credentials mapping
    const creds = await Credential.findOne({ configType: 'main' });
    if (creds) {
      if (user.role === 'superadmin') {
        if (creds.adminCredentials instanceof Map) creds.adminCredentials.delete(user.username);
        else delete creds.adminCredentials[user.username];
      } else if (user.role === 'branchadmin') {
        if (creds.branchCredentials instanceof Map) creds.branchCredentials.delete(user.branch);
        else delete creds.branchCredentials[user.branch];
      } else if (user.role === 'coordinator') {
        const key = `${user.branch}_${user.batch}`;
        if (creds.batchCredentials instanceof Map) creds.batchCredentials.delete(key);
        else delete creds.batchCredentials[key];
      }
      creds.markModified('adminCredentials');
      creds.markModified('branchCredentials');
      creds.markModified('batchCredentials');
      await creds.save();
    }

    await new SecurityLog({
      eventType: 'DeveloperAudit',
      username: req.user.username,
      description: `Soft deleted Admin account: ${user.username}`,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent']
    }).save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admins/:id/details', authenticateSession, authorizeRoles('superadmin'), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.role === 'developer' && req.user.role !== 'developer') {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }

    // Fetch Login History
    const loginHistory = await LoginHistory.find({ username: user.username })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Fetch Device History (distinct device metrics)
    const devices = await LoginHistory.aggregate([
      { $match: { username: user.username } },
      { $group: {
          _id: {
            deviceName: '$deviceName',
            deviceType: '$deviceType',
            osName: '$osName',
            osVersion: '$osVersion',
            browserName: '$browserName',
            browserVersion: '$browserVersion',
            screenResolution: '$screenResolution'
          },
          lastUsed: { $max: '$createdAt' }
      }},
      { $sort: { lastUsed: -1 } }
    ]);

    // Fetch IP History
    const ips = await LoginHistory.aggregate([
      { $match: { username: user.username } },
      { $group: {
          _id: '$ipAddress',
          count: { $sum: 1 },
          lastUsed: { $max: '$createdAt' }
      }},
      { $sort: { lastUsed: -1 } }
    ]);

    // Fetch Security / Audit logs
    const securityLogs = await SecurityLog.find({ username: user.username })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    // Fetch Student data (if matched to student)
    let student = null;
    let attendanceSummary = { present: 0, absent: 0, total: 0 };
    let feeSummary = { totalPaid: 0, payments: [] };

    student = await Student.findOne({
      $or: [
        { email: user.email },
        { phone: user.phone },
        { name: user.fullName }
      ]
    }).lean();

    if (student) {
      // Calculate attendance
      const attendance = await Attendance.find({ 'records.studentId': student.id }).lean();
      let present = 0;
      let absent = 0;
      for (const record of attendance) {
        const studentRec = record.records.find(r => r.studentId === student.id);
        if (studentRec) {
          if (studentRec.status === 'Present') present++;
          else if (studentRec.status === 'Absent') absent++;
        }
      }
      attendanceSummary = { present, absent, total: present + absent };

      // Calculate fees
      feeSummary = {
        totalPaid: (student.payments || []).reduce((acc, curr) => acc + (curr.amount || 0), 0),
        payments: student.payments || []
      };
    }

    res.json({
      user,
      loginHistory,
      devices: devices.map(d => ({ ...d._id, lastUsed: d.lastUsed })),
      ips: ips.map(i => ({ ip: i._id, count: i.count, lastUsed: i.lastUsed })),
      securityLogs,
      student,
      attendanceSummary,
      feeSummary
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api/developer', developerRouter);

app.listen(PORT, () => {
  console.log(`Express server is running on port ${PORT}`);
});
