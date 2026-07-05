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
import HelpReport from './models/HelpReport.js';
import Notification from './models/Notification.js';
import Branch from './models/Branch.js';
import Batch from './models/Batch.js';
import Class from './models/Class.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath, override: true });
} else {
  dotenv.config();
}

const parseScheduleToDays = (schedule) => {
  const defaults = { Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: false, Sun: false };
  if (!schedule) return defaults;
  
  const cleanSched = schedule.toLowerCase().replace(/\s+/g, '');
  if (cleanSched === 'daily') {
    return { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true, Sun: true };
  }
  if (cleanSched === 'weekday' || cleanSched === 'weekdays') {
    return { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false };
  }
  if (cleanSched === 'weekend' || cleanSched === 'weekends') {
    return { Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: true, Sun: true };
  }
  
  const dayNamesShort = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const dayKeys = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  if (cleanSched.includes('-')) {
    const parts = cleanSched.split('-');
    if (parts.length === 2) {
      const startIdx = dayNamesShort.indexOf(parts[0].substring(0, 3));
      const endIdx = dayNamesShort.indexOf(parts[1].substring(0, 3));
      if (startIdx !== -1 && endIdx !== -1) {
        const res = { ...defaults };
        let curr = startIdx;
        while (true) {
          res[dayKeys[curr]] = true;
          if (curr === endIdx) break;
          curr = (curr + 1) % 7;
        }
        return res;
      }
    }
  }
  
  const items = cleanSched.split(',');
  const res = { ...defaults };
  let foundAny = false;
  for (const item of items) {
    const trimmed = item.trim().substring(0, 3);
    const dayIdx = dayNamesShort.indexOf(trimmed);
    if (dayIdx !== -1) {
      res[dayKeys[dayIdx]] = true;
      foundAny = true;
    }
  }
  
  if (foundAny) return res;
  return defaults;
};

const schedulesMatch = (s1, s2) => {
  if (!s1 || !s2) return false;
  const d1 = parseScheduleToDays(s1);
  const d2 = parseScheduleToDays(s2);
  const keys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return keys.every(k => d1[k] === d2[k]);
};

// Console logs in-memory buffer for developer diagnostics
const appLogs = [];

let cachedSettings = {
  maintenanceMode: 'none', // 'none' | 'all' | 'branch' | 'batch' | 'admin'
  systemAlertMessage: '',
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
  if (doc.parentPhone) doc.parentPhone = encrypt(doc.parentPhone);
  if (doc.dob) doc.dob = encrypt(doc.dob);
  if (doc.photo) doc.photo = encrypt(doc.photo);
  return doc;
}

function decryptStudent(student) {
  if (!student) return student;
  const doc = student.toObject ? student.toObject({ flattenMaps: true }) : { ...student };
  if (doc.name) doc.name = decrypt(doc.name);
  if (doc.phone) doc.phone = decrypt(doc.phone);
  if (doc.parentPhone) doc.parentPhone = decrypt(doc.parentPhone);
  if (doc.dob) doc.dob = decrypt(doc.dob);
  if (doc.photo) doc.photo = decrypt(doc.photo);
  return doc;
}

// Attendance field helpers
function encryptAttendanceRecords(records) {
  if (!records) return records;
  const encrypted = {};
  const entries = records instanceof Map ? Array.from(records.entries()) : Object.entries(records);
  for (const [studentId, status] of entries) {
    const val = typeof status === 'object' && status !== null ? JSON.stringify(status) : String(status);
    encrypted[studentId] = encrypt(val);
  }
  return encrypted;
}

function decryptAttendanceRecords(records) {
  if (!records) return records;
  const decrypted = {};
  const entries = records instanceof Map ? Array.from(records.entries()) : Object.entries(records);
  for (const [studentId, status] of entries) {
    const decryptedVal = decrypt(status);
    try {
      if (decryptedVal && (decryptedVal.startsWith('{') || decryptedVal.startsWith('['))) {
        decrypted[studentId] = JSON.parse(decryptedVal);
      } else {
        decrypted[studentId] = decryptedVal;
      }
    } catch (e) {
      decrypted[studentId] = decryptedVal;
    }
  }
  return decrypted;
}

// Helper to retrieve custom batch schedule
async function getBatchSchedule(batchId, branchName) {
  if (!batchId) return null;
  const key = String(batchId).toLowerCase().trim();
  
  // Try querying from Batch model first
  try {
    let query = { code: key };
    if (branchName) {
      query.branchName = new RegExp(`^${branchName.trim()}$`, 'i');
    }
    const dbBatch = await Batch.findOne(query).lean();
    if (dbBatch) {
      return dbBatch.schedule;
    }
  } catch (e) {
    console.error('Error fetching batch schedule from DB:', e);
  }

  const defaults = {
    batch1: 'Mon-Thu',
    batch2: 'Tue-Fri',
    batch3: 'Wed-Sat'
  };
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
  return { role: 'trainer', branch: branchPart, batch: userPart };
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
      branch: session.branch || userDoc.branch,
      batch: session.batch || userDoc.batch
    };

    // --- ENFORCE MAINTENANCE MODE ---
    if (cachedSettings.maintenanceMode && cachedSettings.maintenanceMode !== 'none') {
      let active = true;
      if (cachedSettings.maintenanceStart && cachedSettings.maintenanceEnd) {
        const now = new Date();
        const start = new Date(cachedSettings.maintenanceStart);
        const end = new Date(cachedSettings.maintenanceEnd);
        active = now >= start && now <= end;
      }
      
      if (active) {
        const mode = cachedSettings.maintenanceMode;
        const userRole = req.user.role;
        if (userRole !== 'developer' && userRole !== 'superadmin') {
          if (mode === 'all') {
            return res.status(503).json({ error: 'System is undergoing scheduled maintenance. Access is restricted.' });
          } else if (mode === 'admin' && userRole === 'superadmin') {
            return res.status(503).json({ error: 'Admin portal is undergoing maintenance. Access is temporarily restricted.' });
          } else if (mode === 'branch' && userRole === 'branchadmin') {
            return res.status(503).json({ error: 'Branch Admin portal is undergoing maintenance. Access is restricted.' });
          } else if (mode === 'batch' && userRole === 'trainer') {
            return res.status(503).json({ error: 'Trainer portal is undergoing maintenance. Access is restricted.' });
          }
        }
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

    const usersMap = new Map();

    const collectUser = (username, password, role, branch = '', batch = '') => {
      const uClean = username.toLowerCase().trim();
      const existing = usersMap.get(uClean);
      if (!existing) {
        usersMap.set(uClean, {
          password,
          role,
          branches: new Set(branch ? [branch.toLowerCase().trim()] : []),
          batches: new Set(batch ? [batch.toLowerCase().trim()] : [])
        });
      } else {
        existing.password = password;
        const rolesOrder = { developer: 4, superadmin: 3, branchadmin: 2, trainer: 1 };
        if (rolesOrder[role] > rolesOrder[existing.role]) {
          existing.role = role;
        }
        if (branch) {
          existing.branches.add(branch.toLowerCase().trim());
        }
        if (batch) {
          existing.batches.add(batch.toLowerCase().trim());
        }
      }
    };

    // 1. Sync Superadmins
    const adminEntries = getEntries(creds.adminCredentials);
    for (const [user, pass] of adminEntries) {
      if (pass) {
        const role = user.toLowerCase().trim() === 'developer' ? 'developer' : 'superadmin';
        collectUser(user, pass, role);
      }
    }

    // 2. Sync Branch Coordinators
    const branchEntries = getEntries(creds.branchCredentials);
    for (const [br, info] of branchEntries) {
      if (info && info.password) {
        const username = info.username || `admin@${br}`;
        collectUser(username, info.password, 'branchadmin', br);
      }
    }

    // 3. Sync Batch Coordinators (Consolidated by Trainer Username)
    const batchEntries = getEntries(creds.batchCredentials);
    for (const [key, info] of batchEntries) {
      if (info && info.password) {
        const parts = key.split('_');
        const br = parts[0];
        const bt = parts.slice(1).join('_');
        const username = info.username || `${bt}@${br}`;
        collectUser(username, info.password, 'trainer', br, bt);
      }
    }

    // Write/Update all users from usersMap to DB
    for (const [username, userData] of usersMap.entries()) {
      activeUsernames.add(username);
      
      const branchString = Array.from(userData.branches).join(',');
      const batchString = Array.from(userData.batches).join(',');

      // Retrieve schedules for all batches
      const schedules = [];
      for (const b of userData.batches) {
        const cb = (creds.customBatches || []).find(bObj => String(bObj.id || bObj.code || bObj._id).toLowerCase().trim() === b);
        if (cb && cb.schedule) {
          schedules.push(cb.schedule);
        }
      }
      const scheduleString = Array.from(new Set(schedules)).join(', ');

      const existing = await User.findOne({ username });
      if (!existing) {
        await new User({
          username,
          password: userData.password,
          role: userData.role,
          branch: branchString,
          batch: batchString,
          schedule: scheduleString,
          status: 'Active'
        }).save();
        console.log(`[Sync] Created User account for ${username} (Role: ${userData.role})`);
      } else {
        let changed = false;
        if (existing.password !== userData.password) {
          existing.password = userData.password;
          changed = true;
        }
        if (existing.role !== userData.role) {
          existing.role = userData.role;
          changed = true;
        }
        if (existing.branch !== branchString) {
          existing.branch = branchString;
          changed = true;
        }
        if (existing.batch !== batchString) {
          existing.batch = batchString;
          changed = true;
        }
        if (existing.schedule !== scheduleString) {
          existing.schedule = scheduleString;
          changed = true;
        }
        if (existing.status !== 'Active') {
          existing.status = 'Active';
          changed = true;
        }
        if (changed) {
          await existing.save();
          console.log(`[Sync] Updated User account details for ${username}`);
        }
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

async function seedBranchesAndBatches() {
  try {
    const creds = await Credential.findOne({ configType: 'main' });
    if (!creds) {
      console.log('[Seed] No credentials document found to seed branches/batches.');
      return;
    }

    let credsUpdated = false;
    const defaultBranches = [];
    const defaultBatches = [];

    if (!creds.customBranches || creds.customBranches.length === 0) {
      creds.customBranches = defaultBranches;
      creds.markModified('customBranches');
      credsUpdated = true;
    }
    if (!creds.customBatches || creds.customBatches.length === 0) {
      creds.customBatches = defaultBatches;
      creds.markModified('customBatches');
      credsUpdated = true;
    }
    if (credsUpdated) {
      await creds.save();
    }

    const customBranches = creds.customBranches || [];
    const allBranchNames = Array.from(new Set([...defaultBranches, ...customBranches]));

    // Seed Branches
    for (const name of allBranchNames) {
      const cleanName = name.trim();
      if (/^[0-9a-fA-F]{24}$/.test(cleanName)) {
        console.warn(`[Seed] Skipping seeding branch with invalid hexadecimal name: ${cleanName}`);
        continue;
      }
      const code = cleanName.toLowerCase().replace(/\s+/g, '-');
      if (/^[0-9a-fA-F]{24}$/.test(code)) {
        console.warn(`[Seed] Skipping seeding branch with invalid hexadecimal code: ${code}`);
        continue;
      }
      const existing = await Branch.findOne({ code });
      if (!existing) {
        await new Branch({
          name: cleanName,
          code,
          status: 'Active'
        }).save();
        console.log(`[Seed] Created Branch: ${cleanName} (${code})`);
      }
    }

    // Seed Batches from customBatches and batchCredentials keys
    const customBatches = creds.customBatches || [];
    const batchEntries = creds.batchCredentials instanceof Map ? Array.from(creds.batchCredentials.entries()) : Object.entries(creds.batchCredentials || {});

    // First, process any custom batches (restricting to their correct branches)
    for (const cb of customBatches) {
      const cbId = cb.id.trim();
      const cbName = cb.name.trim();
      const cbSchedule = cb.schedule.trim();

      // Determine target branches for this custom batch
      let targetBranchesForBatch = [];
      if (cb.branch) {
        const matchedBr = allBranchNames.find(b => b.toLowerCase().trim() === cb.branch.toLowerCase().trim());
        if (matchedBr) targetBranchesForBatch.push(matchedBr);
      } else {
        // Fallback: try to find branch from batchCredentials keys
        const matchingCredKey = batchEntries.find(([key]) => key.toLowerCase().endsWith(`_${cbId.toLowerCase()}`));
        if (matchingCredKey) {
          const brKey = matchingCredKey[0].split('_')[0];
          const matchedBr = allBranchNames.find(b => b.toLowerCase().trim() === brKey.toLowerCase().trim());
          if (matchedBr) targetBranchesForBatch.push(matchedBr);
        }
      }

      // If still not resolved, try parsing from name or code
      if (targetBranchesForBatch.length === 0) {
        const nameLower = cbName.toLowerCase();
        if (nameLower.includes('ork')) {
          const br = allBranchNames.find(b => b.toLowerCase() === 'orkatteri');
          if (br) targetBranchesForBatch.push(br);
        } else if (nameLower.includes('prkdv') || nameLower.includes('paarakadav')) {
          const br = allBranchNames.find(b => b.toLowerCase() === 'paarakadav');
          if (br) targetBranchesForBatch.push(br);
        } else if (nameLower.includes('pba') || nameLower.includes('perambra')) {
          const br = allBranchNames.find(b => b.toLowerCase() === 'perambra');
          if (br) targetBranchesForBatch.push(br);
        } else if (nameLower.includes('klkndy') || nameLower.includes('kallikandy')) {
          const br = allBranchNames.find(b => b.toLowerCase() === 'kallikandy');
          if (br) targetBranchesForBatch.push(br);
        } else if (nameLower.includes('ktdy') || nameLower.includes('kuttiady')) {
          const br = allBranchNames.find(b => b.toLowerCase() === 'kuttiady');
          if (br) targetBranchesForBatch.push(br);
        } else {
          // If totally generic (like batch1, batch2), seed to all branches as a default standard
          targetBranchesForBatch = allBranchNames;
        }
      }

      for (const brName of targetBranchesForBatch) {
        const brClean = brName.trim();
        const branchObj = await Branch.findOne({ code: brClean.toLowerCase().replace(/\s+/g, '-') });
        const existing = await Batch.findOne({ 
          branch: new RegExp(`^${brClean}$`, 'i'), 
          code: cbId.toLowerCase() 
        });
        const cbStartTime = cb.startTime || '09:00';
        const cbEndTime = cb.endTime || '10:30';
        const cbSlotType = cb.slotType || 'Morning';
        const cbStatus = cb.status || 'Active';
        if (!existing && branchObj) {
          await new Batch({
            name: cbName,
            code: cbId.toLowerCase(),
            batchName: cbName,
            batchCode: cbId.toLowerCase(),
            branch: brClean,
            branchId: branchObj._id,
            branchName: branchObj.name,
            schedule: cbSchedule,
            startTime: cbStartTime,
            endTime: cbEndTime,
            slotType: cbSlotType,
            status: cbStatus
          }).save();
          console.log(`[Seed] Created Batch: ${cbName} for Branch: ${brClean}`);
        } else if (existing) {
          let changed = false;
          if (existing.branch !== brClean) {
            existing.branch = brClean;
            existing.branchName = branchObj ? branchObj.name : brClean;
            existing.branchId = branchObj ? branchObj._id : existing.branchId;
            changed = true;
          }
          if (existing.schedule !== cbSchedule) { existing.schedule = cbSchedule; changed = true; }
          if (existing.startTime !== cbStartTime) { existing.startTime = cbStartTime; changed = true; }
          if (existing.endTime !== cbEndTime) { existing.endTime = cbEndTime; changed = true; }
          if (existing.slotType !== cbSlotType) { existing.slotType = cbSlotType; changed = true; }
          if (existing.name !== cbName) { existing.name = cbName; existing.batchName = cbName; changed = true; }
          if (existing.status !== cbStatus) { existing.status = cbStatus; changed = true; }
          if (changed) {
            await existing.save();
            console.log(`[Seed] Synced Batch Config: ${cbId} of Branch: ${brClean}`);
          }
        }
      }
    }

    // Second, process any specific batch credentials to assign the right trainer and schedule
    for (const [key, info] of batchEntries) {
      if (info) {
        const parts = key.split('_');
        const brClean = parts[0].trim();
        const btCode = parts.slice(1).join('_').trim().toLowerCase();
        
        // Find existing or create
        const existing = await Batch.findOne({ 
          branch: new RegExp(`^${brClean}$`, 'i'), 
          code: btCode 
        });
        const trainerUser = info.username || `${btCode}@${brClean}`;
        
        if (existing) {
          let changed = false;
          if (existing.trainer !== trainerUser) {
            existing.trainer = trainerUser;
            changed = true;
          }
          const cb = customBatches.find(b => b.id.trim().toLowerCase() === btCode);
          if (cb) {
            const cbStartTime = cb.startTime || '09:00';
            const cbEndTime = cb.endTime || '10:30';
            const cbSlotType = cb.slotType || 'Morning';
            const cbName = cb.name.trim();
            const cbSchedule = cb.schedule.trim();
            const cbStatus = cb.status || 'Active';
            if (existing.startTime !== cbStartTime) { existing.startTime = cbStartTime; changed = true; }
            if (existing.endTime !== cbEndTime) { existing.endTime = cbEndTime; changed = true; }
            if (existing.slotType !== cbSlotType) { existing.slotType = cbSlotType; changed = true; }
            if (existing.schedule !== cbSchedule) { existing.schedule = cbSchedule; changed = true; }
            if (existing.name !== cbName) { existing.name = cbName; existing.batchName = cbName; changed = true; }
            if (existing.status !== cbStatus) { existing.status = cbStatus; changed = true; }
          }
          if (changed) {
            await existing.save();
            console.log(`[Seed] Updated Batch info for: ${btCode} of Branch: ${brClean}`);
          }
        } else {
          // Find matching customBatch name and schedule
          const cb = customBatches.find(b => b.id.trim().toLowerCase() === btCode);
          const name = cb ? cb.name.trim() : (parts.slice(1).join('_').trim());
          const schedule = cb ? cb.schedule.trim() : 'Mon-Thu';
          const startTime = cb ? (cb.startTime || '09:00') : '09:00';
          const endTime = cb ? (cb.endTime || '10:30') : '10:30';
          const slotType = cb ? (cb.slotType || 'Morning') : 'Morning';
          const status = cb && cb.status ? cb.status : 'Active';
          const branchObj = await Branch.findOne({ code: brClean.toLowerCase().replace(/\s+/g, '-') });
          
          if (branchObj) {
            await new Batch({
              name,
              code: btCode,
              batchName: name,
              batchCode: btCode,
              branch: brClean,
              branchId: branchObj._id,
              branchName: branchObj.name,
              trainer: trainerUser,
              schedule,
              startTime,
              endTime,
              slotType,
              status
            }).save();
            console.log(`[Seed] Created Batch: ${name} for Branch: ${brClean} with Trainer: ${trainerUser}`);
          }
        }
      }
    }

    // Clean up outdated/removed batches from MongoDB Batch collection
    const activeBatchCodes = new Set();
    customBatches.forEach(cb => {
      if (cb.id) activeBatchCodes.add(cb.id.trim().toLowerCase());
    });
    batchEntries.forEach(([key]) => {
      const parts = key.split('_');
      if (parts.length > 1) {
        const btCode = parts.slice(1).join('_').trim().toLowerCase();
        activeBatchCodes.add(btCode);
      }
    });

    const allDbBatches = await Batch.find({});
    for (const b of allDbBatches) {
      if (b.code && !activeBatchCodes.has(b.code.toLowerCase().trim())) {
        await Batch.deleteOne({ _id: b._id });
        console.log(`[Seed] Deleted outdated/removed Batch from DB: ${b.name} (${b.code})`);
      }
    }
  } catch (err) {
    console.error('[Seed] Error seeding branches and batches:', err);
  }
}

async function validateBatchesBranchMapping() {
  try {
    const branches = await Branch.find({});
    const batches = await Batch.find({});
    
    console.log(`[Validation] Validating branch mappings for ${batches.length} batches...`);
    
    let flaggedCount = 0;
    let mappedCount = 0;
    let deletedCount = 0;
    const seen = new Set();
    
    for (const batch of batches) {
      const normBranch = batch.branch.toLowerCase().trim();
      const normCode = batch.code.toLowerCase().trim();
      const match = branches.find(br => 
        br.code === normBranch || 
        br.name.toLowerCase().trim() === normBranch
      );
      
      if (match) {
        const uniqKey = `${match._id.toString()}_${normCode}`;
        if (seen.has(uniqKey)) {
          // Duplicate mapping found! Delete it.
          await Batch.deleteOne({ _id: batch._id });
          deletedCount++;
          console.log(`[Validation] Deleted duplicate batch: "${batch.name}" (code: ${batch.code}) for branch "${match.name}"`);
          continue;
        }
        seen.add(uniqKey);

        batch.branchId = match._id;
        batch.branchName = match.name;
        batch.batchName = batch.name;
        batch.batchCode = batch.code;
        batch.flaggedForReview = false;
        mappedCount++;
        await batch.save();
      } else {
        batch.branchId = undefined;
        batch.branchName = undefined;
        batch.flaggedForReview = true;
        flaggedCount++;
        console.warn(`[Validation WARNING] Batch "${batch.name}" (code: ${batch.code}) has no valid branch mapping for branch: "${batch.branch}"! Flagged for admin review.`);
        await batch.save();
      }
    }
    
    console.log(`[Validation] Done. Mapped: ${mappedCount}, Flagged: ${flaggedCount}, Deleted Duplicates: ${deletedCount}.`);
  } catch (err) {
    console.error('[Validation] Error validating batch branch mapping:', err);
  }
}

async function validateBranchBatchMapping(branchVal, batchVal) {
  if (!branchVal || !batchVal) return null;
  const branchDoc = await Branch.findOne({
    $or: [
      { name: new RegExp(`^${branchVal.trim()}$`, 'i') },
      { code: branchVal.toLowerCase().trim() }
    ]
  });
  if (!branchDoc) return null;
  
  const batchDoc = await Batch.findOne({
    branchId: branchDoc._id,
    code: batchVal.toLowerCase().trim()
  });
  return batchDoc;
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
    
    let needsUpdate = false;
    let mode = settings.maintenanceMode;
    if (mode === true || mode === 'true') {
      settings.maintenanceMode = 'all';
      needsUpdate = true;
    } else if (mode === false || mode === 'false' || !mode) {
      settings.maintenanceMode = 'none';
      needsUpdate = true;
    }
    
    if (!settings.systemUpdateNotification) {
      settings.systemUpdateNotification = "Dear Users, we have launched a new Help & Support ticketing system! You can now report issues directly using the floating 'Help' button at the bottom-right. You will also receive notification popups containing developer replies as soon as your tickets are resolved.";
      settings.systemUpdateNotificationId = "default-help-release";
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      await settings.save();
      console.log('[Settings Cache] Legacy maintenanceMode corrected or default announcement populated, and saved to database.');
    }
    
    cachedSettings = settings.toObject();
    
    if (!cachedSettings.systemAlertMessage) {
      cachedSettings.systemAlertMessage = '';
    }
    if (!cachedSettings.systemUpdateNotification) {
      cachedSettings.systemUpdateNotification = '';
    }
    if (!cachedSettings.systemUpdateNotificationId) {
      cachedSettings.systemUpdateNotificationId = '';
    }
    if (!cachedSettings.maintenanceStart) {
      cachedSettings.maintenanceStart = null;
    }
    if (!cachedSettings.maintenanceEnd) {
      cachedSettings.maintenanceEnd = null;
    }
    if (cachedSettings.lockPerformancePage === undefined) cachedSettings.lockPerformancePage = false;
    if (cachedSettings.lockBranchBatchMappingPage === undefined) cachedSettings.lockBranchBatchMappingPage = false;
    if (cachedSettings.lockFeesPage === undefined) cachedSettings.lockFeesPage = false;
    console.log('[Settings Cache] Loaded from database:', cachedSettings);
  } catch (err) {
    console.error('[Settings Cache] Failed to load settings:', err);
  }
}

// Connect to MongoDB Atlas (Sanitize printed URI log for security)
const sanitizedMongoUri = (process.env.MONGO_URI || '').replace(/:([^:@]+)@/, ': [REDACTED] @');

let isInitialConnect = true;

const connectDb = async () => {
  console.log('Connecting to MongoDB URI:', sanitizedMongoUri);
  try {
    await mongoose.connect(process.env.MONGO_URI, { 
      dbName: 'attendance',
      maxPoolSize: 5
    });
    if (isInitialConnect) {
      isInitialConnect = false;
      await loadSettingsCache();
      await migratePlaintextPasswords();
      await migrateDefaultRates();
      
      // Automatic role migration (coordinator/inspector -> trainer)
      try {
        const updateRes1 = await User.updateMany({ role: 'coordinator' }, { role: 'trainer' });
        const updateRes2 = await User.updateMany({ role: 'inspector' }, { role: 'trainer' });
        const totalMigrated = (updateRes1.modifiedCount || 0) + (updateRes2.modifiedCount || 0);
        if (totalMigrated > 0) {
          console.log(`[Migration] Successfully migrated ${totalMigrated} coordinator/inspector accounts to trainer accounts.`);
        }
      } catch (migrationErr) {
        console.error('[Migration] Error migrating coordinator/inspector accounts to trainer accounts:', migrationErr);
      }

      await syncUsersAndSeed();
      await seedBranchesAndBatches();
      await validateBatchesBranchMapping();
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.log('Retrying MongoDB connection in 5 seconds...');
    setTimeout(connectDb, 5000);
  }
};


// Event Listeners for MongoDB connection status changes
mongoose.connection.on('connected', () => {
  console.log('Successfully connected/reconnected to MongoDB Atlas');
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected! Mongoose will automatically attempt to reconnect.');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection event error:', err);
});

// Start the connection process
connectDb();

// Routes

// --- Branches CRUD ---
app.get('/api/public/branches', async (req, res) => {
  try {
    const list = await Branch.find({ status: 'Active' }).sort({ name: 1 }).lean();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/branches', authenticateSession, async (req, res) => {
  try {
    const { role, branch } = req.user;
    let query = {};
    if (role !== 'superadmin' && role !== 'developer') {
      query.name = new RegExp(`^${branch}$`, 'i');
    }
    const list = await Branch.find(query).sort({ name: 1 }).lean();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/branches', authenticateSession, authorizeRoles('superadmin', 'developer'), async (req, res) => {
  try {
    const { name, code, status } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: 'Name and Code are required' });
    }
    const cleanCode = code.toLowerCase().trim();
    if (/^[0-9a-fA-F]{24}$/.test(name.trim()) || /^[0-9a-fA-F]{24}$/.test(cleanCode)) {
      return res.status(400).json({ error: 'Branch name and code cannot be a valid hexadecimal ObjectId' });
    }
    const existing = await Branch.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ error: 'Branch code already exists' });
    }
    const newBranch = new Branch({
      name: name.trim(),
      code: cleanCode,
      status: status || 'Active'
    });
    await newBranch.save();
    res.status(201).json(newBranch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/branches/:id', authenticateSession, authorizeRoles('superadmin', 'developer'), async (req, res) => {
  try {
    const { name, code, status } = req.body;
    const branch = await Branch.findById(req.params.id);
    if (!branch) return res.status(404).json({ error: 'Branch not found' });

    if (code) {
      const cleanCode = code.toLowerCase().trim();
      if (/^[0-9a-fA-F]{24}$/.test(cleanCode)) {
        return res.status(400).json({ error: 'Branch code cannot be a valid hexadecimal ObjectId' });
      }
      if (cleanCode !== branch.code) {
        const existing = await Branch.findOne({ code: cleanCode });
        if (existing) return res.status(400).json({ error: 'Branch code already exists' });
        branch.code = cleanCode;
      }
    }
    if (name) {
      const trimmedName = name.trim();
      if (/^[0-9a-fA-F]{24}$/.test(trimmedName)) {
        return res.status(400).json({ error: 'Branch name cannot be a valid hexadecimal ObjectId' });
      }
      branch.name = trimmedName;
    }
    if (status) branch.status = status;

    await branch.save();
    res.json(branch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/branches/:id', authenticateSession, authorizeRoles('superadmin', 'developer'), async (req, res) => {
  try {
    const deleted = await Branch.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Branch not found' });
    res.json({ success: true, message: 'Branch deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Batches CRUD ---
app.get('/api/public/batches', async (req, res) => {
  try {
    let query = { status: 'Active' };
    const { branchId, branch } = req.query;
    
    // Always enforce valid branch mapping
    query.branchId = { $ne: null, $exists: true };
    
    if (branchId) {
      query.branchId = branchId;
    } else if (branch) {
      query.branch = new RegExp(`^${branch}$`, 'i');
    }
    
    const list = await Batch.find(query).sort({ name: 1 }).lean();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/batches', authenticateSession, async (req, res) => {
  try {
    const { role, branch, batch } = req.user;
    let query = {};
    
    // Always enforce valid branch mapping
    query.branchId = { $ne: null, $exists: true };
    
    const { branchId } = req.query;
    if (branchId) {
      query.branchId = branchId;
    }
    
    if (role !== 'superadmin' && role !== 'developer') {
      const branchObj = await Branch.findOne({ code: branch.toLowerCase().trim().replace(/\s+/g, '-') });
      if (branchObj) {
        query.branchId = branchObj._id;
      } else {
        query.branch = new RegExp(`^${branch}$`, 'i');
      }
      
      if (role === 'trainer') {
        query.code = new RegExp(`^${batch}$`, 'i');
      }
    }
    
    const list = await Batch.find(query).sort({ name: 1 }).lean();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/batches', authenticateSession, authorizeRoles('superadmin', 'developer', 'branchadmin'), async (req, res) => {
  try {
    const { name, code, branch, trainer, schedule, status, startTime, endTime, slotType } = req.body;
    if (!name || !code || !branch) {
      return res.status(400).json({ error: 'Name, Code, and Branch are required' });
    }
    
    // Scoping for branchadmin
    if (req.user.role === 'branchadmin') {
      if (branch.toLowerCase().trim() !== req.user.branch.toLowerCase().trim()) {
        return res.status(403).json({ error: 'Access denied: Cannot create batch for another branch.' });
      }
    }

    const cleanCode = code.toLowerCase().trim();
    const cleanBranch = branch.trim();

    const branchObj = await Branch.findOne({
      $or: [
        { name: new RegExp(`^${cleanBranch}$`, 'i') },
        { code: cleanBranch.toLowerCase().replace(/\s+/g, '-') }
      ]
    });
    if (!branchObj) {
      return res.status(400).json({ error: 'Branch not found. Cannot create batch.' });
    }
    
    const existing = await Batch.findOne({ branchId: branchObj._id, code: cleanCode });
    if (existing) {
      return res.status(400).json({ error: 'Batch code already exists for this branch' });
    }

    const newBatch = new Batch({
      name: name.trim(),
      code: cleanCode,
      branch: branchObj.name,
      branchId: branchObj._id,
      branchName: branchObj.name,
      trainer: trainer || '',
      schedule: schedule || 'Mon-Thu',
      startTime: startTime || '09:00',
      endTime: endTime || '10:30',
      slotType: slotType || 'Morning',
      status: status || 'Active'
    });
    await newBatch.save();
    res.status(201).json(newBatch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/batches/:id', authenticateSession, authorizeRoles('superadmin', 'developer', 'branchadmin'), async (req, res) => {
  try {
    const { name, code, branch, trainer, schedule, status, startTime, endTime, slotType } = req.body;
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ error: 'Batch not found' });

    // Scoping for branchadmin
    if (req.user.role === 'branchadmin') {
      if (batch.branch.toLowerCase().trim() !== req.user.branch.toLowerCase().trim()) {
        return res.status(403).json({ error: 'Access denied: Cannot edit batch of another branch.' });
      }
      if (branch && branch.toLowerCase().trim() !== req.user.branch.toLowerCase().trim()) {
        return res.status(403).json({ error: 'Access denied: Cannot reassign batch to another branch.' });
      }
    }

    if (code || branch) {
      const cleanCode = code ? code.toLowerCase().trim() : batch.code;
      const cleanBranch = branch ? branch.trim() : batch.branch;

      const branchObj = await Branch.findOne({
        $or: [
          { name: new RegExp(`^${cleanBranch}$`, 'i') },
          { code: cleanBranch.toLowerCase().replace(/\s+/g, '-') }
        ]
      });
      if (!branchObj) {
        return res.status(400).json({ error: 'Branch not found. Cannot reassign batch.' });
      }

      if (cleanCode !== batch.code || branchObj._id.toString() !== batch.branchId?.toString()) {
        const existing = await Batch.findOne({ branchId: branchObj._id, code: cleanCode });
        if (existing && existing._id.toString() !== batch._id.toString()) {
          return res.status(400).json({ error: 'Batch code already exists for this branch' });
        }
      }
      batch.code = cleanCode;
      batch.branch = branchObj.name;
      batch.branchId = branchObj._id;
      batch.branchName = branchObj.name;
    }

    if (name) batch.name = name.trim();
    if (trainer !== undefined) batch.trainer = trainer;
    if (schedule) batch.schedule = schedule;
    if (status) batch.status = status;
    if (startTime) batch.startTime = startTime;
    if (endTime) batch.endTime = endTime;
    if (slotType) batch.slotType = slotType;

    await batch.save();
    // Sync with today's persisted Class if it exists
    try {
      const todayStr = new Date().toLocaleDateString('en-CA');
      const classObj = await Class.findOne({
        date: todayStr,
        branch: new RegExp(`^${batch.branch.toLowerCase().trim()}$`, 'i'),
        batch: new RegExp(`^${batch.code.toLowerCase().trim()}$`, 'i')
      });
      if (classObj) {
        if (name) classObj.className = name.trim();
        if (trainer !== undefined) classObj.trainer = trainer.trim();
        if (schedule) classObj.schedule = schedule;
        if (slotType) classObj.slotType = slotType;
        await classObj.save();
      }
    } catch (classErr) {
      console.error("Error updating corresponding today's Class during batch update:", classErr);
    }

    res.json(batch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/batches/:id', authenticateSession, authorizeRoles('superadmin', 'developer', 'branchadmin'), async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ error: 'Batch not found' });

    // Scoping for branchadmin
    if (req.user.role === 'branchadmin') {
      if (batch.branch.toLowerCase().trim() !== req.user.branch.toLowerCase().trim()) {
        return res.status(403).json({ error: 'Access denied: Cannot delete batch of another branch.' });
      }
    }

    await Batch.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Batch deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Today's Classes CRUD ---
app.get('/api/classes', authenticateSession, async (req, res) => {
  try {
    const { role, branch, batch } = req.user;
    const dateStr = req.query.date || new Date().toLocaleDateString('en-CA');
    
    // Parse the dateStr (YYYY-MM-DD) in local time
    const dateParts = dateStr.split('-');
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    const dateObj = new Date(year, month, day);
    
    // Query active batches
    let batchQuery = { status: 'Active' };
    if (role !== 'superadmin' && role !== 'developer') {
      batchQuery.branch = new RegExp(`^${branch}$`, 'i');
      if (role === 'trainer') {
        const allowedBatches = (batch || '').toLowerCase().split(',').map(b => b.trim()).filter(Boolean);
        batchQuery.code = { $in: allowedBatches.map(b => new RegExp(`^${b}$`, 'i')) };
      }
    }
    
    const allActiveBatches = await Batch.find(batchQuery).lean();
    
    // Helper to check if batch runs on the day of dateObj
    const dayIndex = dateObj.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const dayNamesLong = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayNamesShort = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    
    const isDayInSchedule = (schedule) => {
      if (!schedule) return false;
      const cleanSched = schedule.toLowerCase().replace(/\s+/g, '');
      if (cleanSched === 'daily') return true;
      if (cleanSched === 'weekend' || cleanSched === 'weekends') {
        return dayIndex === 0 || dayIndex === 6;
      }
      if (cleanSched === 'weekday' || cleanSched === 'weekdays') {
        return dayIndex >= 1 && dayIndex <= 5;
      }
      if (cleanSched.includes('-')) {
        const parts = cleanSched.split('-');
        if (parts.length === 2) {
          const getIndex = (str) => {
            let idx = dayNamesShort.indexOf(str.substring(0, 3));
            if (idx === -1) idx = dayNamesLong.indexOf(str);
            return idx;
          };
          const startIdx = getIndex(parts[0]);
          const endIdx = getIndex(parts[1]);
          if (startIdx !== -1 && endIdx !== -1) {
            // Only treat as contiguous range if startIdx is Monday (1)
            // or if startIdx <= endIdx and the span doesn't represent Tue-Fri / Wed-Sat
            const isMonStart = startIdx === 1;
            if (isMonStart) {
              if (startIdx <= endIdx) {
                return dayIndex >= startIdx && dayIndex <= endIdx;
              } else {
                return dayIndex >= startIdx || dayIndex <= endIdx;
              }
            } else {
              // Otherwise treat as individual specific days (e.g. Tue-Fri means only Tue and Fri)
              return dayIndex === startIdx || dayIndex === endIdx;
            }
          }
        }
      }
      const items = cleanSched.split(',');
      for (const item of items) {
        const trimmed = item.trim();
        if (trimmed.substring(0, 3) === dayNamesShort[dayIndex] || trimmed === dayNamesLong[dayIndex]) {
          return true;
        }
      }
      return false;
    };
    
    const todayBatches = allActiveBatches.filter(b => isDayInSchedule(b.schedule));
    
    // Fetch persisted class states for this date
    let classQuery = { date: dateStr };
    if (role !== 'superadmin' && role !== 'developer') {
      classQuery.branch = new RegExp(`^${branch}$`, 'i');
      if (role === 'trainer') {
        const allowedBatches = (batch || '').toLowerCase().split(',').map(b => b.trim()).filter(Boolean);
        classQuery.batch = { $in: allowedBatches.map(b => new RegExp(`^${b}$`, 'i')) };
      }
    }
    
    const persistedClasses = await Class.find(classQuery).lean();
    const activePersistedClasses = persistedClasses.filter(pc => {
      if (!pc.schedule) return true;
      return isDayInSchedule(pc.schedule);
    });
    
    const resultList = [];
    
    for (const b of todayBatches) {
      const persisted = activePersistedClasses.find(c => 
        c.batch.toLowerCase().trim() === b.code.toLowerCase().trim() && 
        c.branch.toLowerCase().trim() === b.branch.toLowerCase().trim()
      );
      
      if (persisted) {
        resultList.push(persisted);
      } else {
        resultList.push({
          _id: `virtual_${b._id}`,
          className: b.name,
          branch: b.branch,
          batch: b.code,
          trainer: b.trainer || 'TBA',
          startTime: b.startTime || b.slotType || 'Morning',
          endTime: b.endTime || '',
          subject: '',
          date: dateStr,
          status: 'scheduled',
          cancellationReason: '',
          schedule: b.schedule || '',
          slotType: b.slotType || 'Morning',
          isVirtual: true
        });
      }
    }
    
    // Add ad-hoc manual classes
    for (const pc of activePersistedClasses) {
      const isBatchDerived = todayBatches.some(b => 
        pc.batch.toLowerCase().trim() === b.code.toLowerCase().trim() && 
        pc.branch.toLowerCase().trim() === b.branch.toLowerCase().trim()
      );
      if (!isBatchDerived) {
        resultList.push(pc);
      }
    }
    
    resultList.sort((a, b) => a.startTime.localeCompare(b.startTime));
    res.json(resultList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/classes', authenticateSession, authorizeRoles('superadmin', 'developer', 'branchadmin', 'trainer'), async (req, res) => {
  try {
    const { className, branch, batch, trainer, startTime, endTime, subject, date, status, cancellationReason, schedule, slotType } = req.body;
    if (!className || !branch || !batch || !trainer) {
      return res.status(400).json({ error: 'className, branch, batch, and trainer are required' });
    }

    // Scoping for branchadmin / trainer
    if (req.user.role !== 'superadmin' && req.user.role !== 'developer') {
      if (branch.toLowerCase().trim() !== req.user.branch.toLowerCase().trim()) {
        return res.status(403).json({ error: 'Access denied: Cannot schedule class for another branch.' });
      }
      if (req.user.role === 'trainer') {
        const allowedBatches = (req.user.batch || '').toLowerCase().split(',').map(b => b.trim()).filter(Boolean);
        if (!allowedBatches.includes(batch.toLowerCase().trim())) {
          return res.status(403).json({ error: 'Access denied: Cannot schedule class for another batch.' });
        }
      }
    }

    const newClass = new Class({
      className: className.trim(),
      branch: branch.trim(),
      batch: batch.trim(),
      trainer: trainer.trim(),
      startTime: (startTime || '').trim(),
      endTime: (endTime || '').trim(),
      subject: subject || '',
      date: date || new Date().toLocaleDateString('en-CA'),
      status: status || 'scheduled',
      cancellationReason: cancellationReason || '',
      schedule: schedule || '',
      slotType: slotType || 'Morning'
    });
    await newClass.save();

    // Sync with corresponding Batch in DB
    try {
      const batchObj = await Batch.findOne({
        branch: new RegExp(`^${newClass.branch.toLowerCase().trim()}$`, 'i'),
        code: new RegExp(`^${newClass.batch.toLowerCase().trim()}$`, 'i')
      });
      if (batchObj) {
        batchObj.name = newClass.className;
        batchObj.batchName = newClass.className;
        batchObj.trainer = newClass.trainer;
        if (newClass.schedule) batchObj.schedule = newClass.schedule;
        if (newClass.slotType) batchObj.slotType = newClass.slotType;
        await batchObj.save();
      }
    } catch (batchErr) {
      console.error("Error updating corresponding Batch during class post:", batchErr);
    }

    res.status(201).json(newClass);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/classes/:id', authenticateSession, authorizeRoles('superadmin', 'developer', 'branchadmin', 'trainer'), async (req, res) => {
  try {
    const { className, branch, batch, trainer, startTime, endTime, subject, status, cancellationReason, date, schedule, slotType } = req.body;
    let cls;
    
    if (req.params.id.startsWith('virtual_')) {
      cls = new Class({
        className: className ? className.trim() : 'Class',
        branch: branch ? branch.trim() : req.user.branch,
        batch: batch ? batch.trim() : '',
        trainer: trainer ? trainer.trim() : 'TBA',
        startTime: startTime ? startTime.trim() : '09:00',
        endTime: endTime ? endTime.trim() : '10:30',
        subject: subject || '',
        date: date || new Date().toLocaleDateString('en-CA'),
        status: status || 'scheduled',
        cancellationReason: cancellationReason || '',
        schedule: schedule || '',
        slotType: slotType || 'Morning'
      });
    } else {
      cls = await Class.findById(req.params.id);
      if (!cls) return res.status(404).json({ error: 'Class not found' });
    }

    // Scoping
    if (req.user.role !== 'superadmin' && req.user.role !== 'developer') {
      if (cls.branch.toLowerCase().trim() !== req.user.branch.toLowerCase().trim()) {
        return res.status(403).json({ error: 'Access denied: Cannot edit class of another branch.' });
      }
      if (branch && branch.toLowerCase().trim() !== req.user.branch.toLowerCase().trim()) {
        return res.status(403).json({ error: 'Access denied: Cannot reassign class to another branch.' });
      }
      if (req.user.role === 'trainer') {
        const allowedBatches = (req.user.batch || '').toLowerCase().split(',').map(b => b.trim()).filter(Boolean);
        if (!allowedBatches.includes(cls.batch.toLowerCase().trim())) {
          return res.status(403).json({ error: 'Access denied: Cannot edit class of another batch.' });
        }
        if (batch && !allowedBatches.includes(batch.toLowerCase().trim())) {
          return res.status(403).json({ error: 'Access denied: Cannot reassign class to another batch.' });
        }
      }
    }

    if (className) cls.className = className.trim();
    if (branch) cls.branch = branch.trim();
    if (batch) cls.batch = batch.trim();
    if (trainer) cls.trainer = trainer.trim();
    if (startTime) cls.startTime = startTime.trim();
    if (endTime) cls.endTime = endTime.trim();
    if (subject !== undefined) cls.subject = subject;
    if (status) cls.status = status;
    if (cancellationReason !== undefined) cls.cancellationReason = cancellationReason;
    if (date) cls.date = date;
    if (schedule !== undefined) cls.schedule = schedule;
    if (slotType !== undefined) cls.slotType = slotType;

    await cls.save();
    // Sync with corresponding Batch in DB
    try {
      const batchObj = await Batch.findOne({
        branch: new RegExp(`^${cls.branch.toLowerCase().trim()}$`, 'i'),
        code: new RegExp(`^${cls.batch.toLowerCase().trim()}$`, 'i')
      });
      if (batchObj) {
        batchObj.name = cls.className;
        batchObj.batchName = cls.className;
        batchObj.trainer = cls.trainer;
        if (cls.schedule) batchObj.schedule = cls.schedule;
        if (cls.slotType) batchObj.slotType = cls.slotType;
        await batchObj.save();
      }
    } catch (batchErr) {
      console.error("Error updating corresponding Batch during class update:", batchErr);
    }

    res.json(cls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/classes/:id', authenticateSession, authorizeRoles('superadmin', 'developer', 'branchadmin', 'trainer'), async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ error: 'Class not found' });

    // Scoping
    if (req.user.role !== 'superadmin' && req.user.role !== 'developer') {
      if (cls.branch.toLowerCase().trim() !== req.user.branch.toLowerCase().trim()) {
        return res.status(403).json({ error: 'Access denied: Cannot delete class of another branch.' });
      }
      if (req.user.role === 'trainer') {
        const allowedBatches = (req.user.batch || '').toLowerCase().split(',').map(b => b.trim()).filter(Boolean);
        if (!allowedBatches.includes(cls.batch.toLowerCase().trim())) {
          return res.status(403).json({ error: 'Access denied: Cannot delete class of another batch.' });
        }
      }
    }

    await Class.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Class deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Dashboard Stats API ---
app.get('/api/dashboard/stats', authenticateSession, async (req, res) => {
  try {
    const { role, branch: userBranch, batch: userBatch } = req.user;
    
    const targetBranch = req.query.branch || '';
    const targetBatch = req.query.batch || '';

    // Scopes for queries
    let studentQuery = { status: 'Active' };
    let trainerQuery = { role: 'trainer', status: 'Active' };
    let adminQuery = { role: { $in: ['superadmin', 'branchadmin'] }, status: 'Active' };
    let branchQuery = { status: 'Active' };
    let batchQuery = { status: 'Active' };

    let selectedBranchName = '';
    let selectedBatchCode = '';

    if (role === 'superadmin' || role === 'developer') {
      selectedBranchName = targetBranch;
      selectedBatchCode = targetBatch;
    } else {
      selectedBranchName = userBranch;
      if (role === 'trainer') {
        const allowedBatches = (userBatch || '').toLowerCase().split(',').map(b => b.trim()).filter(Boolean);
        if (targetBatch && targetBatch.toLowerCase() !== 'all') {
          if (allowedBatches.includes(targetBatch.toLowerCase().trim())) {
            selectedBatchCode = targetBatch;
          } else {
            selectedBatchCode = 'none'; // block access
          }
        } else {
          selectedBatchCode = userBatch; // comma-separated list of allowed batches
        }
      } else {
        selectedBatchCode = targetBatch;
      }
    }

    if (selectedBranchName && selectedBranchName.toLowerCase() !== 'all') {
      const brRegex = new RegExp(`^${selectedBranchName.trim()}$`, 'i');
      studentQuery.branch = brRegex;
      trainerQuery.branch = brRegex;
      adminQuery.branch = brRegex;
      batchQuery.branch = brRegex;
    }
    let selectedBatchObj = null;
    let selectedBatchObjs = [];
    if (selectedBatchCode && selectedBatchCode.toLowerCase() !== 'all') {
      const BatchModel = mongoose.model('Batch');
      const codes = selectedBatchCode.split(',').map(c => c.trim()).filter(Boolean);
      selectedBatchObjs = await BatchModel.find({ code: { $in: codes.map(c => new RegExp(`^${c}$`, 'i')) } }).lean();
      selectedBatchObj = selectedBatchObjs[0] || null;
      batchQuery.code = { $in: codes.map(c => new RegExp(`^${c}$`, 'i')) };
    }

    // Fetch active students and filter in memory to support legacy fallbacks consistently
    const baseStudents = await Student.find(studentQuery).select('-photo').lean();
    const filteredStudents = baseStudents.filter(s => {
      if (!selectedBatchCode || selectedBatchCode.toLowerCase() === 'all') return true;
      if (selectedBatchCode === 'none') return false;

      const studentBatchLower = (s.batch || '').toLowerCase().trim();
      const codes = selectedBatchCode.toLowerCase().split(',').map(c => c.trim()).filter(Boolean);

      if (codes.includes(studentBatchLower)) return true;

      for (const obj of selectedBatchObjs) {
        if (studentBatchLower === obj.code.toLowerCase().trim()) return true;
        if (studentBatchLower === obj.name.toLowerCase().trim()) return true;
      }

      // Fallback check for legacy students using schedule
      if (studentBatchLower && (studentBatchLower.startsWith('batch') || studentBatchLower.startsWith('batch_'))) {
        return false;
      }

      for (const obj of selectedBatchObjs) {
        if (schedulesMatch(s.schedule, obj.schedule)) return true;
      }

      for (const c of codes) {
        if (c.includes('-') || c.includes(',')) {
          if (schedulesMatch(s.schedule, c)) return true;
        }
      }

      return false;
    });

    const totalStudents = filteredStudents.length;
    const totalTrainers = await User.countDocuments(trainerQuery);
    const totalAdmins = await User.countDocuments(adminQuery);
    const totalBranches = await Branch.countDocuments(branchQuery);
    const totalBatches = await Batch.countDocuments(batchQuery);

    // Attendance Calculations
    // To get Today's present and absent:
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD local
    const todayAttendance = await Attendance.findOne({ date: todayStr }).lean();
    
    let presentToday = 0;
    let absentToday = 0;
    
    // Total attendance records count
    const allAttendance = await Attendance.find({}).lean();
    let totalAttendanceRecords = 0;
    let totalPresentCount = 0;
    let totalAbsentCount = 0;

    // Filter student IDs in our scope to only count attendance of students we care about
    const scopedStudentIds = new Set(filteredStudents.map(s => String(s.id)));

    // Process all attendance records for stats
    for (const record of allAttendance) {
      const decryptedRecs = decryptAttendanceRecords(record.records);
      const isToday = record.date === todayStr;

      for (const [studentId, statusData] of Object.entries(decryptedRecs)) {
        if (scopedStudentIds.has(studentId)) {
          totalAttendanceRecords++;
          let statusStr = '';
          if (typeof statusData === 'object' && statusData !== null) {
            statusStr = statusData.status;
          } else {
            statusStr = String(statusData);
          }

          const statusLower = statusStr.toLowerCase();
          if (statusLower === 'present') {
            totalPresentCount++;
            if (isToday) presentToday++;
          } else if (statusLower === 'absent') {
            totalAbsentCount++;
            if (isToday) absentToday++;
          }
        }
      }
    }

    const attendancePercentage = (totalPresentCount + totalAbsentCount) > 0 
      ? Math.round((totalPresentCount / (totalPresentCount + totalAbsentCount)) * 100) 
      : 0;

    // Fees Calculations
    // We fetch students to calculate fees. We calculate fee collection (paid) & pending fees (outstanding).
    // Let's retrieve SystemSettings to get startingBillingMonth
    const systemSettings = await SystemSetting.findOne({ configKey: 'main' }).lean();
    const startingBillingMonth = systemSettings?.startingBillingMonth || ''; // YYYY-MM

    // Let's get the main configuration rates
    const config = await Credential.findOne({ configType: 'main' }).lean();
    const defaultMonthlyRate = config?.monthlyFeeRate || 600;
    const defaultAdmissionRate = config?.admissionFeeRate || 1500;

    let feeCollection = 0;
    let pendingFees = 0;
    let totalFeeRecords = 0;

    // Let's calculate months helper
    const getMonthDiff = (startStr, endStr) => {
      const [sYr, sMth] = startStr.split('-').map(Number);
      const [eYr, eMth] = endStr.split('-').map(Number);
      return (eYr - sYr) * 12 + (eMth - sMth);
    };

    const currentYear = new Date().getFullYear();
    const currentMonthNum = new Date().getMonth() + 1; // 1-12
    const currentYearMonth = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;

    // Loop through scoped students
    const fullScopedStudents = filteredStudents;
    for (const student of fullScopedStudents) {
      const joinDate = student.joinDate || '2026-01-01';
      const joinYearMonth = joinDate.substring(0, 7); // YYYY-MM

      // Determine starting month for fee calculation:
      let startFeeMonth = joinYearMonth;
      if (startingBillingMonth && startingBillingMonth > startFeeMonth) {
        startFeeMonth = startingBillingMonth;
      }

      // Calculate monthly fee rate for this student
      let monthlyRate = student.customMonthlyRate !== null && student.customMonthlyRate !== undefined 
        ? student.customMonthlyRate 
        : defaultMonthlyRate;

      // Apply coupon discount if applicable
      if (student.discountPercentage > 0 && student.couponType === 'percentage') {
        monthlyRate = monthlyRate * (1 - student.discountPercentage / 100);
      } else if (student.couponValue > 0 && student.couponType === 'amount') {
        monthlyRate = Math.max(0, monthlyRate - student.couponValue);
      }

      // Calculate how many months have elapsed from startFeeMonth to currentYearMonth
      if (startFeeMonth <= currentYearMonth) {
        const diff = getMonthDiff(startFeeMonth, currentYearMonth);
        for (let i = 0; i <= diff; i++) {
          const checkYear = parseInt(startFeeMonth.split('-')[0]) + Math.floor((parseInt(startFeeMonth.split('-')[1]) - 1 + i) / 12);
          const checkMonth = ((parseInt(startFeeMonth.split('-')[1]) - 1 + i) % 12) + 1;
          const ymStr = `${checkYear}-${String(checkMonth).padStart(2, '0')}`;

          totalFeeRecords++;
          const paidMonths = student.paidMonths || {};
          // In Mongoose Map, lookups can be a Map or standard object
          const isPaid = paidMonths instanceof Map ? paidMonths.get(ymStr) : paidMonths[ymStr];

          if (isPaid) {
            feeCollection += monthlyRate;
          } else {
            pendingFees += monthlyRate;
          }
        }
      }

      // Handle admission fee
      let admissionRate = student.customAdmissionRate !== null && student.customAdmissionRate !== undefined 
        ? student.customAdmissionRate 
        : defaultAdmissionRate;

      // Check if admission paid
      const isAdmissionPaid = student.admissionPaid;
      if (isAdmissionPaid) {
        feeCollection += admissionRate;
      } else {
        pendingFees += admissionRate;
      }
      totalFeeRecords++;
    }

    res.json({
      totalStudents,
      totalTrainers,
      totalAdmins,
      totalBranches,
      totalBatches,
      totalAttendanceRecords,
      totalFeeRecords,
      presentToday,
      absentToday,
      attendancePercentage,
      feeCollection: Math.round(feeCollection),
      pendingFees: Math.round(pendingFees)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1. Get all students (excl. photo for memory optimization, scoped by user permissions)
app.get('/api/students', authenticateSession, async (req, res) => {
  try {
    const { role, branch, batch } = req.user;
    
    // Support query parameters
    const queryBranch = req.query.branchId || req.query.branch || '';
    const queryBatch = req.query.batchId || req.query.batch || '';

    let filter = {};
    
    // Resolve branch scoping
    let targetBranch = '';
    if (role === 'superadmin' || role === 'developer') {
      targetBranch = queryBranch;
    } else {
      targetBranch = branch;
    }

    if (targetBranch && targetBranch.toLowerCase() !== 'all') {
      // If queryBranch is an ObjectId, resolve the branch name from Branch model
      if (mongoose.Types.ObjectId.isValid(targetBranch)) {
        const branchObj = await Branch.findById(targetBranch);
        if (branchObj) {
          filter.branch = new RegExp(`^${branchObj.name}$`, 'i');
        } else {
          filter.branch = targetBranch;
        }
      } else {
        filter.branch = new RegExp(`^${targetBranch}$`, 'i');
      }
    }

    // Fetch active students and filter by batch (supporting legacy and batchId/batchName mapping)
    const baseStudents = await Student.find(filter).select('-photo').lean();

    // Resolve batch details if targetBatch is selected
    let targetBatchCode = '';
    let allowedTrainerBatches = [];
    if (role === 'trainer') {
      allowedTrainerBatches = (batch || '').toLowerCase().split(',').map(b => b.trim()).filter(Boolean);
      if (queryBatch && queryBatch.toLowerCase() !== 'all') {
        if (allowedTrainerBatches.includes(queryBatch.toLowerCase().trim())) {
          targetBatchCode = queryBatch;
        } else {
          targetBatchCode = 'none'; // unauthorized batch selection
        }
      } else {
        targetBatchCode = batch; // all trainer's batches
      }
    } else {
      targetBatchCode = queryBatch;
    }

    let selectedBatchObj = null;
    let selectedBatchObjs = [];
    if (targetBatchCode && targetBatchCode.toLowerCase() !== 'all') {
      const BatchModel = mongoose.model('Batch');
      const codes = targetBatchCode.split(',').map(c => c.trim()).filter(Boolean);
      selectedBatchObjs = await BatchModel.find({
        code: { $in: codes.map(c => new RegExp(`^${c}$`, 'i')) }
      }).lean();
      selectedBatchObj = selectedBatchObjs[0] || null;
    }

    const decryptedStudents = baseStudents.map(decryptStudent);

    const filteredStudents = decryptedStudents.filter(s => {
      if (!targetBatchCode || targetBatchCode.toLowerCase() === 'all') return true;
      if (targetBatchCode === 'none') return false;

      const studentBatchLower = (s.batch || '').toLowerCase().trim();
      const codes = targetBatchCode.toLowerCase().split(',').map(c => c.trim()).filter(Boolean);

      // Check if student's batch is in the selected batch list
      if (codes.includes(studentBatchLower)) return true;

      // Check direct match with selectedBatchObjs code or name
      for (const obj of selectedBatchObjs) {
        if (studentBatchLower === obj.code.toLowerCase().trim()) return true;
        if (studentBatchLower === obj.name.toLowerCase().trim()) return true;
        if (mongoose.Types.ObjectId.isValid(targetBatchCode) && String(obj._id) === targetBatchCode) {
          if (studentBatchLower === obj.code.toLowerCase().trim() || studentBatchLower === obj.name.toLowerCase().trim()) return true;
        }
      }

      // Fallback for legacy students using schedule
      if (studentBatchLower && (studentBatchLower.startsWith('batch') || studentBatchLower.startsWith('batch_'))) {
        return false;
      }

      for (const obj of selectedBatchObjs) {
        if (schedulesMatch(s.schedule, obj.schedule)) return true;
      }

      for (const c of codes) {
        if (c.includes('-') || c.includes(',')) {
          if (schedulesMatch(s.schedule, c)) return true;
        }
      }

      return false;
    });

    // Populate required fields: studentName, admissionNumber, branchId, branchName, batchId, batchName
    const populatedStudents = await Promise.all(filteredStudents.map(async (s) => {
      // Find branchId and branchName
      let branchId = '';
      let branchName = s.branch || '';
      
      const branchDoc = await Branch.findOne({ name: new RegExp(`^${branchName.trim()}$`, 'i') });
      if (branchDoc) {
        branchId = String(branchDoc._id);
        branchName = branchDoc.name;
      }

      // Find batchId and batchName
      let batchId = '';
      let batchName = s.batch || '';

      const batchDoc = await Batch.findOne({
        $or: [
          { code: new RegExp(`^${batchName.trim()}$`, 'i') },
          { name: new RegExp(`^${batchName.trim()}$`, 'i') }
        ]
      });
      if (batchDoc) {
        batchId = String(batchDoc._id);
        batchName = batchDoc.name;
      } else {
        // Look up by schedule fallback if legacy
        const legacyBatch = await Batch.findOne({
          branchId: branchDoc ? branchDoc._id : undefined,
          schedule: new RegExp(`^${s.schedule}$`, 'i')
        });
        if (legacyBatch) {
          batchId = String(legacyBatch._id);
          batchName = legacyBatch.name;
        }
      }

      return {
        ...s,
        studentName: s.name,
        admissionNumber: s.admissionNo || String(s.id),
        branchId,
        branchName,
        batchId,
        batchName
      };
    }));

    res.json(populatedStudents);
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
    if (role === 'trainer') {
      const allowedBatches = (batch || '').toLowerCase().split(',').map(b => b.trim()).filter(Boolean);
      filter.batch = { $in: allowedBatches };
    }
    const student = await Student.findOne(filter).select('photo').lean();
    if (!student) return res.status(404).json({ error: 'Student not found or unauthorized' });
    res.json({ photo: decrypt(student.photo) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public student self-enrollment endpoint
app.post('/api/public/students', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const dbErr = 'Database connection is not active';
      console.error(`[Student Creation Error] ${dbErr}`);
      addLog('error', dbErr);
      return res.status(500).json({ error: dbErr });
    }

    if (!req.body.name || typeof req.body.name !== 'string' || !req.body.name.trim()) {
      return res.status(400).json({ error: 'Valid student name is required' });
    }
    if (req.body.age === undefined || isNaN(Number(req.body.age))) {
      return res.status(400).json({ error: 'Valid student age is required' });
    }
    if (!req.body.dob || typeof req.body.dob !== 'string' || !req.body.dob.trim()) {
      return res.status(400).json({ error: 'Valid Date of Birth is required' });
    }
    if (!req.body.phone || typeof req.body.phone !== 'string' || !/^\d{10}$/.test(req.body.phone.trim())) {
      return res.status(400).json({ error: 'Student Mobile number must be exactly 10 digits' });
    }
    if (!req.body.parentPhone || typeof req.body.parentPhone !== 'string' || !/^\d{10}$/.test(req.body.parentPhone.trim())) {
      return res.status(400).json({ error: 'Parent Mobile number must be exactly 10 digits' });
    }
    if (!req.body.branch || typeof req.body.branch !== 'string' || !req.body.branch.trim()) {
      return res.status(400).json({ error: 'Valid branch name is required' });
    }
    if (!req.body.batch || typeof req.body.batch !== 'string' || !req.body.batch.trim()) {
      return res.status(400).json({ error: 'Valid batch code is required' });
    }

    const dbBatch = await validateBranchBatchMapping(req.body.branch, req.body.batch);
    if (!dbBatch) {
      return res.status(400).json({ error: `Selected batch '${req.body.batch}' is not actively mapped to the branch '${req.body.branch}'` });
    }
    req.body.branch = dbBatch.branchName;
    req.body.batch = dbBatch.code;
    req.body.schedule = dbBatch.schedule;

    const existingStudents = await Student.find({ branch: req.body.branch }).select('name phone').lean();
    const isDuplicate = existingStudents.some(s => {
      const decryptedName = decrypt(s.name);
      const decryptedPhone = decrypt(s.phone);
      return decryptedName.toLowerCase().trim() === req.body.name.toLowerCase().trim() &&
             decryptedPhone.trim() === req.body.phone.trim();
    });

    if (isDuplicate) {
      const dupErr = 'A student with the same name and phone number already exists in this branch';
      console.error(`[Student Creation Error] ${dupErr}`);
      addLog('error', dupErr);
      return res.status(400).json({ error: dupErr });
    }

    console.log(`[Student Creation] Creating public student: Name: ${req.body.name}, Age: ${req.body.age}, Branch: ${req.body.branch}`);
    addLog('api', `Creating public student: Name: ${req.body.name}, Branch: ${req.body.branch}`);

    let nextId;
    let saved = null;
    let attempts = 0;
    while (!saved && attempts < 5) {
      attempts++;
      const lastStudent = await Student.findOne().sort({ id: -1 });
      nextId = lastStudent && lastStudent.id ? lastStudent.id + 1 : 1;
      
      req.body.id = nextId;
      const encryptedBody = encryptStudentData(req.body);
      const newStudent = new Student(encryptedBody);
      
      try {
        saved = await newStudent.save();
      } catch (saveErr) {
        if (saveErr.code === 11000) {
          continue;
        }
        throw saveErr;
      }
    }

    if (!saved) {
      throw new Error('Failed to generate a unique student ID after multiple attempts');
    }

    console.log(`[Student Creation] Successfully saved public student to database. ID: ${saved.id}`);
    res.status(201).json(decryptStudent(saved));
  } catch (err) {
    console.error(`[Student Creation Error] Exception caught: ${err.message}`);
    addLog('error', `Failed to create student: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
});

// 2. Create student (scoped validation)
app.post('/api/students', authenticateSession, async (req, res) => {
  try {
    const { role, branch } = req.user;
    
    // Validate MongoDB connection before saving
    if (mongoose.connection.readyState !== 1) {
      const dbErr = 'Database connection is not active';
      console.error(`[Student Creation Error] ${dbErr}`);
      addLog('error', dbErr);
      return res.status(500).json({ error: dbErr });
    }

    // Validate request body branch
    if (role !== 'superadmin' && role !== 'developer') {
      if (!req.body.branch || String(req.body.branch).toLowerCase().trim() !== branch.toLowerCase().trim()) {
        const authErr = 'Unauthorized: cannot enroll student in another branch';
        console.error(`[Student Creation Error] ${authErr}`);
        addLog('error', authErr);
        return res.status(403).json({ error: authErr });
      }
    }

    if (!req.body.branch || typeof req.body.branch !== 'string' || !req.body.branch.trim()) {
      return res.status(400).json({ error: 'Valid branch name is required' });
    }
    if (!req.body.batch || typeof req.body.batch !== 'string' || !req.body.batch.trim()) {
      return res.status(400).json({ error: 'Valid batch code is required' });
    }

    const dbBatch = await validateBranchBatchMapping(req.body.branch, req.body.batch);
    if (!dbBatch) {
      return res.status(400).json({ error: `Selected batch '${req.body.batch}' is not actively mapped to the branch '${req.body.branch}'` });
    }
    req.body.branch = dbBatch.branchName;
    req.body.batch = dbBatch.code;
    req.body.schedule = dbBatch.schedule;

    // Input Validation
    if (!req.body.name || typeof req.body.name !== 'string' || !req.body.name.trim()) {
      return res.status(400).json({ error: 'Valid student name is required' });
    }
    if (req.body.age === undefined || isNaN(Number(req.body.age))) {
      return res.status(400).json({ error: 'Valid student age is required' });
    }
    if (!req.body.dob || typeof req.body.dob !== 'string' || !req.body.dob.trim()) {
      return res.status(400).json({ error: 'Valid Date of Birth is required' });
    }
    if (!req.body.phone || typeof req.body.phone !== 'string' || !/^\d{10}$/.test(req.body.phone.trim())) {
      return res.status(400).json({ error: 'Student Mobile number must be exactly 10 digits' });
    }
    if (!req.body.parentPhone || typeof req.body.parentPhone !== 'string' || !/^\d{10}$/.test(req.body.parentPhone.trim())) {
      return res.status(400).json({ error: 'Parent Mobile number must be exactly 10 digits' });
    }

    // Check for duplicate student (same name & phone number in the branch)
    const existingStudents = await Student.find({ branch: req.body.branch }).select('name phone').lean();
    const isDuplicate = existingStudents.some(s => {
      const decryptedName = decrypt(s.name);
      const decryptedPhone = decrypt(s.phone);
      return decryptedName.toLowerCase().trim() === req.body.name.toLowerCase().trim() &&
             decryptedPhone.trim() === req.body.phone.trim();
    });

    if (isDuplicate) {
      const dupErr = 'A student with the same name and phone number already exists in this branch';
      console.error(`[Student Creation Error] ${dupErr}`);
      addLog('error', dupErr);
      return res.status(400).json({ error: dupErr });
    }

    console.log(`[Student Creation] Creating student: Name: ${req.body.name}, Age: ${req.body.age}, Branch: ${req.body.branch}`);
    addLog('api', `Creating student: Name: ${req.body.name}, Branch: ${req.body.branch}`);

    // Generate unique numeric ID on the server side to prevent duplicates
    let nextId;
    let saved = null;
    let attempts = 0;
    while (!saved && attempts < 5) {
      attempts++;
      const lastStudent = await Student.findOne().sort({ id: -1 });
      nextId = lastStudent && lastStudent.id ? lastStudent.id + 1 : 1;
      
      req.body.id = nextId;
      const encryptedBody = encryptStudentData(req.body);
      const newStudent = new Student(encryptedBody);
      
      try {
        saved = await newStudent.save();
      } catch (saveErr) {
        if (saveErr.code === 11000) {
          // Duplicate key error, retry with a new max id
          continue;
        }
        throw saveErr;
      }
    }

    if (!saved) {
      throw new Error('Failed to generate a unique student ID after multiple attempts');
    }

    console.log(`[Student Creation] Successfully saved student to database. ID: ${saved.id}`);
    res.status(201).json(decryptStudent(saved));
  } catch (err) {
    console.error(`[Student Creation Error] Exception caught: ${err.message}`);
    addLog('error', `Failed to create student: ${err.message}`);
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

    const targetBranch = req.body.branch !== undefined ? req.body.branch : student.branch;
    const targetBatch = req.body.batch !== undefined ? req.body.batch : student.batch;
    if (req.body.branch !== undefined || req.body.batch !== undefined) {
      if (!targetBranch || !targetBatch) {
        return res.status(400).json({ error: 'Branch and Batch are required' });
      }
      const dbBatch = await validateBranchBatchMapping(targetBranch, targetBatch);
      if (!dbBatch) {
        return res.status(400).json({ error: `Selected batch '${targetBatch}' is not actively mapped to the branch '${targetBranch}'` });
      }
      req.body.branch = dbBatch.branchName;
      req.body.batch = dbBatch.code;
      req.body.schedule = dbBatch.schedule;
    }

    // Input Validation
    if (req.body.name !== undefined && (typeof req.body.name !== 'string' || !req.body.name.trim())) {
      return res.status(400).json({ error: 'Student name must be a non-empty string' });
    }
    if (req.body.dob !== undefined && (typeof req.body.dob !== 'string' || !req.body.dob.trim())) {
      return res.status(400).json({ error: 'Valid Date of Birth is required' });
    }
    if (req.body.phone !== undefined && (typeof req.body.phone !== 'string' || !/^\d{10}$/.test(req.body.phone.trim()))) {
      return res.status(400).json({ error: 'Student Mobile number must be exactly 10 digits' });
    }
    if (req.body.parentPhone !== undefined && (typeof req.body.parentPhone !== 'string' || !/^\d{10}$/.test(req.body.parentPhone.trim()))) {
      return res.status(400).json({ error: 'Parent Mobile number must be exactly 10 digits' });
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
    let allowedStudentIds = null;
    
    const currentYear = new Date().getFullYear();
    let queryYear = currentYear;
    if (req.query.year) {
      const parsedYear = parseInt(req.query.year, 10);
      if (!isNaN(parsedYear)) queryYear = parsedYear;
    }
    
    const records = await Attendance.find({
      date: { $gte: `${queryYear}-01-01`, $lte: `${queryYear}-12-31` }
    }).lean();
    
    if (role !== 'superadmin' && role !== 'developer') {
      let studentFilter = { branch: new RegExp(`^${branch}$`, 'i') };
      if (role === 'trainer') {
        const allowedBatches = (batch || '').toLowerCase().split(',').map(b => b.trim()).filter(Boolean);
        studentFilter.batch = { $in: allowedBatches };
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
      if (role === 'trainer') {
        const allowedBatches = (batch || '').toLowerCase().split(',').map(b => b.trim()).filter(Boolean);
        studentFilter.batch = { $in: allowedBatches };
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

    let allowedStudents;
    if (role === 'superadmin' || role === 'developer') {
      allowedStudents = await Student.find({}).select('id').lean();
    } else {
      allowedStudents = await Student.find(studentFilter).select('id').lean();
    }
    const allowedIds = new Set(allowedStudents.map(s => String(s.id)));

    allowedIds.forEach(idStr => {
      if (records[idStr] !== undefined && records[idStr] !== null && records[idStr] !== 'none') {
        finalDecryptedRecords[idStr] = records[idStr];
      } else {
        delete finalDecryptedRecords[idStr];
      }
    });

    const encryptedRecords = encryptAttendanceRecords(finalDecryptedRecords);
    
    attendanceDoc.records = new Map(Object.entries(encryptedRecords));
    attendanceDoc.markModified('records');
    
    const saved = await attendanceDoc.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Submit a help report / ticket (accessible to any logged-in user)
app.post('/api/help-reports', authenticateSession, async (req, res) => {
  try {
    const { issueDescription, deviceName, userAgent } = req.body;
    if (!issueDescription || !issueDescription.trim()) {
      return res.status(400).json({ error: 'Issue description is required' });
    }

    const username = req.user.username;
    const role = req.user.role || '';
    const branch = req.user.branch || '';
    const batch = req.user.batch || '';
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

    const newReport = new HelpReport({
      username,
      role,
      branch,
      batch,
      issueDescription: issueDescription.trim(),
      deviceName: deviceName || 'Unknown Device',
      userAgent: userAgent || req.headers['user-agent'] || '',
      ipAddress,
      status: 'Pending'
    });

    const savedReport = await newReport.save();
    res.status(201).json({ success: true, report: savedReport });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch help reports/tickets submitted by the logged-in user
app.get('/api/help-reports', authenticateSession, async (req, res) => {
  try {
    const reports = await HelpReport.find({ username: req.user.username })
      .sort({ createdAt: -1 })
      .lean();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch unseen resolved help reports for the logged-in user
app.get('/api/help-reports/unseen-resolved', authenticateSession, async (req, res) => {
  try {
    const reports = await HelpReport.find({
      username: req.user.username.toLowerCase().trim(),
      status: 'Resolved',
      seenByUser: false
    })
      .sort({ updatedAt: -1 })
      .lean();
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark a help report as seen/acknowledged by the user
app.put('/api/help-reports/:id/seen', authenticateSession, async (req, res) => {
  try {
    const report = await HelpReport.findOneAndUpdate(
      { _id: req.params.id, username: req.user.username.toLowerCase().trim() },
      { seenByUser: true },
      { new: true }
    );
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Notifications API Endpoints
// Retrieve notifications (scoped for regular users, supports ?all=true for developer/superadmin)
app.get('/api/notifications', authenticateSession, async (req, res) => {
  try {
    const { role, username, branch, batch } = req.user;
    const showAll = req.query.all === 'true';

    if (showAll && (role === 'developer' || role === 'superadmin')) {
      const notifications = await Notification.find().sort({ createdAt: -1 }).lean();
      return res.json(notifications);
    }

    const now = new Date();
    const filter = {
      $and: [
        {
          $or: [
            { isScheduled: { $ne: true } },
            { scheduledAt: { $lte: now } }
          ]
        },
        {
          $or: [
            { expiryDate: null },
            { expiryDate: { $gt: now } }
          ]
        },
        {
          $or: [
            { branch: 'all' },
            { branch: new RegExp(`^${branch}$`, 'i') }
          ]
        },
        {
          $or: [
            { batch: 'all' },
            { batch: new RegExp(`^${batch}$`, 'i') }
          ]
        },
        {
          $or: [
            { targetUser: 'all' },
            { targetUser: new RegExp(`^${username}$`, 'i') }
          ]
        }
      ]
    };

    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).lean();
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new notification (restricted to developer/superadmin)
app.post('/api/notifications', authenticateSession, authorizeRoles('developer', 'superadmin'), async (req, res) => {
  try {
    const { title, message, type, priority, branch, batch, targetUser, expiryDate, scheduledAt, isScheduled } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Notification title is required' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Notification message is required' });
    }
    
    const notification = new Notification({
      title: title.trim(),
      message: message.trim(),
      type: type || 'general',
      sender: req.user.username,
      priority: priority || 'medium',
      branch: branch || 'all',
      batch: batch || 'all',
      targetUser: targetUser || 'all',
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      isScheduled: !!isScheduled
    });
    
    const saved = await notification.save();
    console.log(`[Notification] Created new notification: "${saved.title}" by ${saved.sender}`);
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Edit an existing notification (restricted to developer/superadmin)
app.put('/api/notifications/:id', authenticateSession, authorizeRoles('developer', 'superadmin'), async (req, res) => {
  try {
    const { title, message, type, priority, branch, batch, targetUser, expiryDate, scheduledAt, isScheduled } = req.body;
    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ error: 'Notification title cannot be empty' });
    }
    if (message !== undefined && !message.trim()) {
      return res.status(400).json({ error: 'Notification message cannot be empty' });
    }

    const updateFields = {};
    if (title !== undefined) updateFields.title = title.trim();
    if (message !== undefined) updateFields.message = message.trim();
    if (type !== undefined) updateFields.type = type || 'general';
    if (priority !== undefined) updateFields.priority = priority || 'medium';
    if (branch !== undefined) updateFields.branch = branch || 'all';
    if (batch !== undefined) updateFields.batch = batch || 'all';
    if (targetUser !== undefined) updateFields.targetUser = targetUser || 'all';
    if (expiryDate !== undefined) updateFields.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (scheduledAt !== undefined) updateFields.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    if (isScheduled !== undefined) updateFields.isScheduled = !!isScheduled;

    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Notification not found' });
    console.log(`[Notification] Updated notification: "${updated.title}" by ${req.user.username}`);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Mark notification as read by the user
app.put('/api/notifications/:id/read', authenticateSession, async (req, res) => {
  try {
    const username = req.user.username.toLowerCase().trim();
    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { readBy: username } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Notification not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Mark notification as unread by the user
app.put('/api/notifications/:id/unread', authenticateSession, async (req, res) => {
  try {
    const username = req.user.username.toLowerCase().trim();
    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      { $pull: { readBy: username } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Notification not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a notification (restricted to developer/superadmin)
app.delete('/api/notifications/:id', authenticateSession, authorizeRoles('developer', 'superadmin'), async (req, res) => {
  try {
    const deleted = await Notification.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Notification not found' });
    console.log(`[Notification] Deleted notification: "${deleted.title}"`);
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Public endpoint to check system maintenance status & alerts
app.get('/api/system/maintenance', async (req, res) => {
  try {
    const now = new Date();
    let isUpcoming = false;
    let isActive = false;
    
    if (cachedSettings.maintenanceMode && cachedSettings.maintenanceMode !== 'none') {
      if (cachedSettings.maintenanceStart && cachedSettings.maintenanceEnd) {
        const start = new Date(cachedSettings.maintenanceStart);
        const end = new Date(cachedSettings.maintenanceEnd);
        if (now > end) {
          let settings = await SystemSetting.findOne({ configKey: 'main' });
          if (settings) {
            settings.maintenanceMode = 'none';
            settings.maintenanceStart = null;
            settings.maintenanceEnd = null;
            await settings.save();
            cachedSettings = settings.toObject();
            console.log('[Maintenance schedule] Ended. Auto-reset mode to none.');
          }
        } else {
          isUpcoming = now < start;
          isActive = now >= start && now <= end;
        }
      } else {
        isActive = true;
      }
    }

    res.json({
      maintenanceMode: cachedSettings.maintenanceMode || 'none',
      maintenanceStart: cachedSettings.maintenanceStart || null,
      maintenanceEnd: cachedSettings.maintenanceEnd || null,
      isMaintenanceUpcoming: isUpcoming,
      isMaintenanceActive: isActive,
      systemAlertMessage: cachedSettings.systemAlertMessage || '',
      systemUpdateNotification: cachedSettings.systemUpdateNotification || '',
      systemUpdateNotificationId: cachedSettings.systemUpdateNotificationId || '',
      lockPerformancePage: !!cachedSettings.lockPerformancePage,
      lockBranchBatchMappingPage: !!cachedSettings.lockBranchBatchMappingPage,
      lockFeesPage: !!cachedSettings.lockFeesPage
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

    const user = await User.findOne({ username: enteredUser });

    const userRole = user ? user.role : '';

    // --- ENFORCE ACCOUNT LOCKED STATE (Level 1, Level 2, Permanent) ---
    if (user && user.role !== 'developer') {
      if (user.isLocked) {
        return res.status(423).json({ success: false, error: 'Your account is locked due to security limits. Please contact the administrator.' });
      }

      if (user.lockUntil && new Date() < user.lockUntil) {
        if (user.failedAttempts >= 10) {
          return res.status(423).json({ success: false, error: 'Account temporarily locked. Please try again after 15 minutes.' });
        } else if (user.failedAttempts >= 5) {
          return res.status(423).json({ success: false, error: 'Too many failed login attempts. Please try again after 5 minutes.' });
        }
      }
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
        role: 'guest',
        description: `Failed login attempt: account username not found.`,
        ipAddress: clientIp,
        userAgent,
        deviceInfo: `${deviceName || 'Unknown Device'} (${deviceDetails.browser || 'Unknown Browser'} on ${deviceDetails.os || 'Unknown OS'})`
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
      const isSuper = loginType === 'superadmin' && user.role === 'superadmin';
      const isTrainer = (loginType === 'trainer' || loginType === 'coordinator') && (user.role === 'branchadmin' || user.role === 'trainer');
      const isDeveloper = loginType === 'developer' && user.role === 'developer';

      if (!isSuper && !isTrainer && !isDeveloper) {
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

      // Enforce strict branch and batch selection checks for Trainer and Branch Admin portals
      const bodyBranch = String(branch || '').toLowerCase().trim();
      const bodyBatch = String(batch || '').toLowerCase().trim();

      if (isTrainer) {
        const allowedBranches = String(user.branch || '').toLowerCase().split(',').map(s => s.trim());
        const allowedBatches = String(user.batch || '').toLowerCase().split(',').map(s => s.trim());

        if (user.role === 'branchadmin') {
          if (!allowedBranches.includes(bodyBranch) || bodyBatch !== 'admin') {
            await new LoginHistory({
              username: user.username,
              status: 'Failed',
              ipAddress: clientIp,
              userAgent,
              deviceName: deviceName || 'Unknown Device',
              ...deviceDetails,
              screenResolution: resolution
            }).save();
            return res.status(401).json({ success: false, error: 'Invalid branch selection for this Branch Admin account' });
          }
        } else if (user.role === 'trainer') {
          if (!allowedBranches.includes(bodyBranch) || !allowedBatches.includes(bodyBatch)) {
            await new LoginHistory({
              username: user.username,
              status: 'Failed',
              ipAddress: clientIp,
              userAgent,
              deviceName: deviceName || 'Unknown Device',
              ...deviceDetails,
              screenResolution: resolution
            }).save();
            return res.status(401).json({ success: false, error: 'Invalid branch or batch selection for this Trainer account' });
          }
        }
      }

      const token = crypto.randomBytes(32).toString('hex');
      await new Session({
        username: user.username,
        token,
        branch: bodyBranch,
        batch: bodyBatch,
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
      user.lockUntil = null;
      user.lockedAt = null;
      await user.save();

      return res.json({ success: true, username: user.username, token, role: user.role, branch: branch || user.branch, batch: batch || user.batch, loginCount: user.loginCount });
    }

    // Password verification failed
    user.failedAttempts = (user.failedAttempts || 0) + 1;
    user.failedLoginCount = (user.failedLoginCount || 0) + 1;

    let lockoutError = null;

    if (user.role !== 'developer') {
      if (user.failedAttempts > 10) {
        user.isLocked = true;
        user.lockUntil = null;
        user.lockedAt = new Date();
        lockoutError = 'Your account is locked due to security limits. Please contact the administrator.';
      } else if (user.failedAttempts === 10) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
        user.lockedAt = new Date();
        lockoutError = 'Account temporarily locked. Please try again after 15 minutes.';
      } else if (user.failedAttempts === 5) {
        user.lockUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 mins lock
        user.lockedAt = new Date();
        lockoutError = 'Too many failed login attempts. Please try again after 5 minutes.';
      }
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
      role: user.role,
      description: lockoutError || `Failed login attempt: invalid password. Attempts: ${user.failedAttempts}`,
      ipAddress: clientIp,
      userAgent,
      deviceInfo: `${deviceName || 'Unknown Device'} (${deviceDetails.browser || 'Unknown Browser'} on ${deviceDetails.os || 'Unknown OS'})`
    }).save();

    if (lockoutError) {
      return res.status(423).json({ success: false, error: lockoutError });
    }

    if (user.isLocked) {
      return res.status(423).json({ success: false, error: 'Your account is locked due to security limits. Please contact the administrator.' });
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
        return res.json({ success: true, username: session.username, role: user.role, branch: session.branch || user.branch, batch: session.batch || user.batch, loginCount: user.loginCount });
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
app.get('/api/credentials/raw', authenticateSession, authorizeRoles('superadmin', 'developer'), async (req, res) => {
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

// Get credentials (passwords masked for security - All authenticated roles)
app.get('/api/credentials', authenticateSession, authorizeRoles('superadmin', 'developer', 'branchadmin', 'trainer'), async (req, res) => {
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

// Update credentials (auto-hashes new passwords - Super Admin and Branch Admin)
app.put('/api/credentials', authenticateSession, authorizeRoles('superadmin', 'developer', 'branchadmin'), async (req, res) => {
  try {
    const body = { ...req.body };

    // Fetch existing credentials to preserve un-modified hashed passwords
    let credsDoc = await Credential.findOne({ configType: 'main' });
    if (!credsDoc) {
      credsDoc = new Credential({ configType: 'main' });
    }

    // Role-based validation for branchadmin
    if (req.user.role === 'branchadmin') {
      const userBranch = String(req.user.branch || '').toLowerCase().trim();
      if (!userBranch) {
        return res.status(403).json({ error: 'Access denied: Branch admin has no assigned branch.' });
      }

      // 1. Reject modifications to disallowed fields
      const disallowed = ['adminCredentials', 'branchCredentials', 'customBranches', 'monthlyFeeRate', 'admissionFeeRate', 'coupons'];
      for (const field of disallowed) {
        if (body[field] !== undefined) {
          const existingVal = credsDoc[field] && typeof credsDoc[field].toJSON === 'function'
            ? credsDoc[field].toJSON()
            : credsDoc[field];
          const newVal = body[field];
          if (JSON.stringify(existingVal) !== JSON.stringify(newVal)) {
            return res.status(403).json({ error: `Access denied: Branch admin is not authorized to modify ${field}.` });
          }
        }
      }

      // 2. Validate customBatches additions/modifications/deletions belong only to their own branch
      if (body.customBatches !== undefined) {
        const existingBatches = credsDoc.customBatches || [];
        const newBatches = body.customBatches;
        if (!Array.isArray(newBatches)) {
          return res.status(400).json({ error: 'customBatches must be an array.' });
        }

        // Helper to resolve the branch of a custom batch using db state & patterns
        const getBatchBranch = (cb) => {
          const cbId = String(cb.id || cb.code || cb._id || '').trim().toLowerCase();
          const existing = existingBatches.find(eb => String(eb.id || eb.code || eb._id || '').trim().toLowerCase() === cbId);
          
          if (existing && existing.branch) {
            return existing.branch.toLowerCase().trim();
          }
          if (cb.branch) {
            return cb.branch.toLowerCase().trim();
          }

          const batchEntries = credsDoc.batchCredentials instanceof Map 
            ? Array.from(credsDoc.batchCredentials.entries()) 
            : Object.entries(credsDoc.batchCredentials || {});
          const matchingCredKey = batchEntries.find(([key]) => key.toLowerCase().endsWith(`_${cbId}`));
          if (matchingCredKey) {
            return matchingCredKey[0].split('_')[0].toLowerCase().trim();
          }
          
          const nameToTest = existing ? existing.name : cb.name;
          const nameLower = String(nameToTest || '').toLowerCase();
          if (nameLower.includes('ork')) return 'orkatteri';
          if (nameLower.includes('prkdv') || nameLower.includes('paarakadav')) return 'paarakadav';
          if (nameLower.includes('pba') || nameLower.includes('perambra')) return 'perambra';
          if (nameLower.includes('klkndy') || nameLower.includes('kallikandy')) return 'kallikandy';
          if (nameLower.includes('ktdy') || nameLower.includes('kuttiady')) return 'kuttiady';
          
          return 'all';
        };

        // Validate that other branch batches are NOT added, modified, or deleted by branchadmin
        const dbOthers = existingBatches.filter(b => getBatchBranch(b) !== userBranch);
        const reqOthers = newBatches.filter(b => getBatchBranch(b) !== userBranch);

        if (dbOthers.length !== reqOthers.length) {
          return res.status(403).json({ error: 'Access denied: You cannot add or delete batches for other branches.' });
        }

        for (const dbB of dbOthers) {
          const dbBId = String(dbB.id || dbB.code || dbB._id || '').trim().toLowerCase();
          const reqB = reqOthers.find(rb => String(rb.id || rb.code || rb._id || '').trim().toLowerCase() === dbBId);
          if (!reqB) {
            return res.status(403).json({ error: 'Access denied: You cannot delete batches for other branches.' });
          }
          if (
            (reqB.name || reqB.batchName || '') !== (dbB.name || dbB.batchName || '') ||
            (reqB.schedule || '') !== (dbB.schedule || '') ||
            (reqB.branch || '').toLowerCase().trim() !== (dbB.branch || '').toLowerCase().trim()
          ) {
            return res.status(403).json({ error: 'Access denied: You cannot modify batches for other branches.' });
          }
        }
      }

      // 3. Validate batchCredentials additions/modifications/deletions match prefix userBranch + '_'
      if (body.batchCredentials !== undefined) {
        const existingCreds = credsDoc.batchCredentials && typeof credsDoc.batchCredentials.toJSON === 'function'
          ? credsDoc.batchCredentials.toJSON()
          : (credsDoc.batchCredentials || {});
        const newCreds = body.batchCredentials;

        const prefix = userBranch + '_';

        for (const [key, val] of Object.entries(existingCreds)) {
          if (!key.toLowerCase().startsWith(prefix)) {
            if (!newCreds[key]) {
              return res.status(403).json({ error: `Access denied: You cannot delete batch credentials for other branches (${key}).` });
            }
            const newVal = newCreds[key];
            if (newVal.username !== val.username || (newVal.password !== val.password && newVal.password !== '••••••')) {
              return res.status(403).json({ error: `Access denied: You cannot modify batch credentials for other branches (${key}).` });
            }
          }
        }

        for (const key of Object.keys(newCreds)) {
          if (!key.toLowerCase().startsWith(prefix)) {
            if (!existingCreds[key]) {
              return res.status(403).json({ error: `Access denied: You cannot add batch credentials for other branches (${key}).` });
            }
          }
        }
      }
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
      if (Array.isArray(body.customBranches)) {
        credsDoc.customBranches = body.customBranches.map(b => {
          if (typeof b === 'string') return b.trim();
          if (b && typeof b === 'object') return (b.name || '').trim();
          return '';
        }).filter(name => name !== '' && !/^[0-9a-fA-F]{24}$/.test(name));
      } else {
        credsDoc.customBranches = [];
      }
      credsDoc.markModified('customBranches');
    }

    if (body.customBatches !== undefined) {
      let sanitizedCustomBatches = [];
      if (Array.isArray(body.customBatches)) {
        sanitizedCustomBatches = body.customBatches.map(b => {
          const id = b.id || b.code || b._id || '';
          const name = b.name || b.batchName || '';
          const schedule = b.schedule || 'Mon-Thu';
          return {
            id: String(id).trim(),
            name: String(name).trim(),
            schedule: String(schedule).trim(),
            branch: b.branch ? String(b.branch).trim() : undefined,
            startTime: b.startTime ? String(b.startTime).trim() : undefined,
            endTime: b.endTime ? String(b.endTime).trim() : undefined,
            slotType: b.slotType ? String(b.slotType).trim() : undefined,
            status: b.status ? String(b.status).trim() : 'Active'
          };
        }).filter(b => b.id !== '' && b.name !== '');
      }

      if (req.user.role === 'branchadmin') {
        const userBranch = String(req.user.branch || '').toLowerCase().trim();
        const getBatchBranch = (cb) => {
          const cbId = String(cb.id || cb.code || cb._id || '').trim().toLowerCase();
          const existing = credsDoc.customBatches.find(eb => String(eb.id || eb.code || eb._id || '').trim().toLowerCase() === cbId);
          
          if (existing && existing.branch) {
            return existing.branch.toLowerCase().trim();
          }
          if (cb.branch) {
            return cb.branch.toLowerCase().trim();
          }

          const batchEntries = credsDoc.batchCredentials instanceof Map 
            ? Array.from(credsDoc.batchCredentials.entries()) 
            : Object.entries(credsDoc.batchCredentials || {});
          const matchingCredKey = batchEntries.find(([key]) => key.toLowerCase().endsWith(`_${cbId}`));
          if (matchingCredKey) {
            return matchingCredKey[0].split('_')[0].toLowerCase().trim();
          }
          
          const nameToTest = existing ? existing.name : cb.name;
          const nameLower = String(nameToTest || '').toLowerCase();
          if (nameLower.includes('ork')) return 'orkatteri';
          if (nameLower.includes('prkdv') || nameLower.includes('paarakadav')) return 'paarakadav';
          if (nameLower.includes('pba') || nameLower.includes('perambra')) return 'perambra';
          if (nameLower.includes('klkndy') || nameLower.includes('kallikandy')) return 'kallikandy';
          if (nameLower.includes('ktdy') || nameLower.includes('kuttiady')) return 'kuttiady';
          
          return 'all';
        };

        const otherBranchesBatches = credsDoc.customBatches.filter(b => getBatchBranch(b) !== userBranch);
        credsDoc.customBatches = [...otherBranchesBatches, ...sanitizedCustomBatches];
      } else {
        credsDoc.customBatches = sanitizedCustomBatches;
      }
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
    // Seed/sync branches and batches collection immediately
    await seedBranchesAndBatches();
    
    res.json(credsDoc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get system settings (All authenticated roles)
app.get('/api/system-settings', authenticateSession, async (req, res) => {
  try {
    const settings = await SystemSetting.findOne({ configKey: 'main' }).lean();
    res.json(settings || { startingBillingMonth: '' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update system settings (Super Admin and Developer only)
app.put('/api/system-settings', authenticateSession, authorizeRoles('superadmin', 'developer'), async (req, res) => {
  try {
    const { startingBillingMonth } = req.body;
    let settings = await SystemSetting.findOne({ configKey: 'main' });
    if (!settings) {
      settings = new SystemSetting({ configKey: 'main' });
    }
    if (startingBillingMonth !== undefined) {
      settings.startingBillingMonth = String(startingBillingMonth).trim();
    }
    await settings.save();
    cachedSettings = settings.toObject();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
        } else if (oldRole === 'trainer') {
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
          } else if (newRole === 'trainer') {
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

// Get all locked accounts (temporary or permanent locks)
developerRouter.get('/locked-users', async (req, res) => {
  try {
    const lockedUsers = await User.find({
      $or: [
        { isLocked: true },
        { lockUntil: { $ne: null, $gt: new Date() } }
      ]
    }).select('username role phone failedAttempts isLocked lockUntil lockedAt updatedAt').lean();
    
    res.json(lockedUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
      user.lockUntil = null;
      user.lockedAt = null;
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
      } else if (user.role === 'trainer') {
        const batches = String(user.batch || '').split(',').map(b => b.trim()).filter(Boolean);
        for (const bt of batches) {
          const key = `${user.branch}_${bt}`;
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

// Delete User (Supports Soft and Permanent delete)
developerRouter.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isPermanent = req.query.permanent === 'true';
    const userToEdit = await User.findById(id);
    if (!userToEdit) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const uName = userToEdit.username;
    const uRole = userToEdit.role;
    const uBranch = userToEdit.branch;
    const uBatch = userToEdit.batch;

    if (isPermanent) {
      await User.findByIdAndDelete(id);
    } else {
      userToEdit.status = 'SoftDeleted';
      await userToEdit.save();
    }
    
    // Sync to Credential model by removing the user entry
    const creds = await Credential.findOne({ configType: 'main' });
    if (creds) {
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
      } else if (uRole === 'trainer') {
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
      eventType: isPermanent ? 'UserPermanentDelete' : 'UserStatusUpdate',
      username: req.user.username,
      description: isPermanent ? `Permanently deleted user ${uName}` : `Soft-deleted user ${uName}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    }).save();
    
    res.json({ success: true, message: isPermanent ? 'User permanently deleted successfully' : 'User soft-deleted successfully' });
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

// Delete specific login history entry (restricted to developer)
developerRouter.delete('/login-history/:id', async (req, res) => {
  try {
    const deleted = await LoginHistory.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Login history entry not found' });
    res.json({ success: true, message: 'Login history entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete all login history entries (restricted to developer)
developerRouter.delete('/login-history', async (req, res) => {
  try {
    const result = await LoginHistory.deleteMany({});
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete specific security log entry (restricted to developer)
developerRouter.delete('/security-logs/:id', async (req, res) => {
  try {
    const deleted = await SecurityLog.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Security log entry not found' });
    res.json({ success: true, message: 'Security log entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete all security log entries (restricted to developer)
developerRouter.delete('/security-logs', async (req, res) => {
  try {
    const result = await SecurityLog.deleteMany({});
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
    
    let dbDataSizeVal = 0;
    let dbDataSize = '0.00 MB';
    let dbStorageSize = '0.00 MB';
    if (mongoose.connection.readyState === 1) {
      try {
        const stats = await mongoose.connection.db.command({ dbStats: 1 });
        dbDataSizeVal = stats.dataSize;
        dbDataSize = (stats.dataSize / (1024 * 1024)).toFixed(2) + ' MB';
        dbStorageSize = (stats.storageSize / (1024 * 1024)).toFixed(2) + ' MB';
      } catch (e) {
        console.error('Failed to fetch db stats for system-status:', e);
      }
    }

    const freeMemBytes = os.freemem();
    const totalMemBytes = os.totalmem();
    const processMem = process.memoryUsage();
    
    const rssMb = Math.round(processMem.rss / (1024 * 1024));
    const dbMb = parseFloat((dbDataSizeVal / (1024 * 1024)).toFixed(2));
    
    res.json({
      databaseStatus: dbStatus,
      dbDataSize,
      dbStorageSize,
      activeUsers: activeUsersCount.length,
      totalSessions: totalSessionsCount,
      ramLimit: '512 MB',
      dbLimit: '512 MB',
      ramWarning: rssMb > 410,
      dbWarning: dbMb > 410,
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
          rss: rssMb + ' MB',
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

// 3.1 Device logs aggregation
developerRouter.get('/device-logs', async (req, res) => {
  try {
    const list = await LoginHistory.aggregate([
      {
        $group: {
          _id: {
            deviceName: "$deviceName",
            deviceType: "$deviceType",
            os: "$os",
            browser: "$browser"
          },
          count: { $sum: 1 },
          lastUsed: { $max: "$createdAt" }
        }
      },
      { $sort: { lastUsed: -1 } }
    ]);
    res.json(list.map(item => ({
      deviceName: item._id.deviceName || 'Unknown Device',
      deviceType: item._id.deviceType || 'Desktop',
      os: item._id.os || 'Unknown OS',
      browser: item._id.browser || 'Unknown Browser',
      count: item.count,
      lastUsed: item.lastUsed
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3.2 IP logs aggregation
developerRouter.get('/ip-logs', async (req, res) => {
  try {
    const list = await LoginHistory.aggregate([
      {
        $group: {
          _id: "$ipAddress",
          count: { $sum: 1 },
          lastUsed: { $max: "$createdAt" },
          details: { $first: "$$ROOT" }
        }
      },
      { $sort: { lastUsed: -1 } }
    ]);
    res.json(list.map(item => ({
      ip: item._id || 'Unknown IP',
      count: item.count,
      lastUsed: item.lastUsed,
      browser: item.details?.browser || 'Unknown Browser',
      os: item.details?.os || 'Unknown OS'
    })));
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
    const { 
      maintenanceMode, 
      maintenanceStart, 
      maintenanceEnd, 
      systemAlertMessage, 
      systemUpdateNotification, 
      sessionTimeoutMinutes, 
      minPasswordLength, 
      failedLoginThreshold, 
      failedLoginBlockTimeMinutes, 
      logRetentionLimit, 
      startingBillingMonth,
      lockPerformancePage,
      lockBranchBatchMappingPage,
      lockFeesPage
    } = req.body;
    
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
    
    if (maintenanceMode !== undefined) settings.maintenanceMode = String(maintenanceMode);
    if (startingBillingMonth !== undefined) settings.startingBillingMonth = String(startingBillingMonth).trim();
    if (maintenanceStart !== undefined) settings.maintenanceStart = maintenanceStart ? new Date(maintenanceStart) : null;
    if (maintenanceEnd !== undefined) settings.maintenanceEnd = maintenanceEnd ? new Date(maintenanceEnd) : null;
    if (systemAlertMessage !== undefined) settings.systemAlertMessage = String(systemAlertMessage).trim();
    
    if (lockPerformancePage !== undefined) settings.lockPerformancePage = !!lockPerformancePage;
    if (lockBranchBatchMappingPage !== undefined) settings.lockBranchBatchMappingPage = !!lockBranchBatchMappingPage;
    if (lockFeesPage !== undefined) settings.lockFeesPage = !!lockFeesPage;

    if (systemUpdateNotification !== undefined && systemUpdateNotification !== settings.systemUpdateNotification) {
      settings.systemUpdateNotification = String(systemUpdateNotification).trim();
      settings.systemUpdateNotificationId = Date.now().toString(); // Generate unique notification ID
    }
    
    if (sessionTimeoutMinutes !== undefined) settings.sessionTimeoutMinutes = parseInt(sessionTimeoutMinutes, 10);
    if (minPasswordLength !== undefined) settings.minPasswordLength = parseInt(minPasswordLength, 10);
    if (failedLoginThreshold !== undefined) settings.failedLoginThreshold = parseInt(failedLoginThreshold, 10);
    if (failedLoginBlockTimeMinutes !== undefined) settings.failedLoginBlockTimeMinutes = parseInt(failedLoginBlockTimeMinutes, 10);
    if (logRetentionLimit !== undefined) settings.logRetentionLimit = parseInt(logRetentionLimit, 10);
    
    // If maintenance schedule has already ended, clear the dates so it applies immediately
    if (settings.maintenanceStart && settings.maintenanceEnd) {
      const end = new Date(settings.maintenanceEnd);
      if (new Date() > end) {
        settings.maintenanceStart = null;
        settings.maintenanceEnd = null;
      }
    }
    
    await settings.save();
    cachedSettings = settings.toObject();

    // Automatically publish a system-wide announcement/notification when a maintenance is scheduled
    if (settings.maintenanceStart && settings.maintenanceEnd && settings.maintenanceMode !== 'none') {
      const startStr = new Date(settings.maintenanceStart).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
      const endStr = new Date(settings.maintenanceEnd).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
      
      let portalNames = 'All Portals';
      if (settings.maintenanceMode === 'batch') portalNames = 'Trainer / Batch Portal';
      else if (settings.maintenanceMode === 'branch') portalNames = 'Branch Admin Portal';
      else if (settings.maintenanceMode === 'admin') portalNames = 'Super Admin Portal';
      else if (settings.maintenanceMode === 'branch-batch') portalNames = 'Branch Admin & Trainer Portals';
      else if (settings.maintenanceMode === 'batch-admin') portalNames = 'Trainer & Super Admin Portals';
      else if (settings.maintenanceMode === 'admin-branch') portalNames = 'Super Admin & Branch Admin Portals';

      const announcementTitle = `⚠️ Scheduled System Maintenance Warning`;
      const announcementMessage = `Dear Users,\n\nPlease be advised that the system has scheduled maintenance from ${startStr} to ${endStr}.\n\nDuring this time, the following portals will be locked: ${portalNames}.\n\nPlease ensure you save all your active work and log out of the system before the maintenance starts.`;

      // Check if a warning for this exact start time already exists to avoid duplicate spam
      const existingNotif = await Notification.findOne({
        title: announcementTitle,
        message: { $regex: startStr }
      });

      if (!existingNotif) {
        // Delete any previous system maintenance warning notifications to keep it clean
        await Notification.deleteMany({ type: 'maintenance' });

        const newNotif = new Notification({
          title: announcementTitle,
          message: announcementMessage,
          type: 'maintenance',
          sender: 'developer',
          priority: 'high',
          branch: 'all',
          batch: 'all',
          targetUser: 'all'
        });
        await newNotif.save();
        console.log(`[Maintenance Announcement] Created auto warning: "${newNotif.title}"`);
      }
    } else if (settings.maintenanceMode === 'none') {
      await Notification.deleteMany({ type: 'maintenance' });
      console.log(`[Maintenance Announcement] Deleted maintenance warnings because mode is set to none.`);
    }

    // Immediately terminate active sessions of blocked roles
    if (settings.maintenanceMode && settings.maintenanceMode !== 'none') {
      let blockedRoles = [];
      if (settings.maintenanceMode === 'all') {
        blockedRoles = ['superadmin', 'branchadmin', 'trainer'];
      } else if (settings.maintenanceMode === 'admin') {
        blockedRoles = ['superadmin'];
      } else if (settings.maintenanceMode === 'branch') {
        blockedRoles = ['branchadmin'];
      } else if (settings.maintenanceMode === 'batch') {
        blockedRoles = ['trainer'];
      } else if (settings.maintenanceMode === 'branch-batch') {
        blockedRoles = ['branchadmin', 'trainer'];
      } else if (settings.maintenanceMode === 'batch-admin') {
        blockedRoles = ['trainer', 'superadmin'];
      } else if (settings.maintenanceMode === 'admin-branch') {
        blockedRoles = ['superadmin', 'branchadmin'];
      }

      if (blockedRoles.length > 0) {
        // Find users matching these roles
        const usersToBlock = await User.find({ role: { $in: blockedRoles } }).select('username').lean();
        const usernamesToBlock = usersToBlock.map(u => u.username.toLowerCase().trim());
        
        if (usernamesToBlock.length > 0) {
          const deleteResult = await Session.deleteMany({ username: { $in: usernamesToBlock } });
          console.log(`[Maintenance Lockout] Immediately logged out ${deleteResult.deletedCount} sessions for roles: ${blockedRoles.join(', ')}`);
        }
      }
    }
    
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
app.get('/api/admins', authenticateSession, authorizeRoles('superadmin', 'developer'), async (req, res) => {
  try {
    const { role, branch } = req.user;
    let query = {
      status: { $ne: 'SoftDeleted' }
    };
    if (role === 'branchadmin') {
      query.branch = new RegExp(`^${branch}$`, 'i');
      query.role = 'trainer';
    } else {
      query.role = { $in: ['superadmin', 'branchadmin', 'trainer'] };
    }

    const admins = await User.find(query).lean();

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

app.post('/api/admins', authenticateSession, authorizeRoles('superadmin', 'developer'), async (req, res) => {
  try {
    const { username, password, role, branch, batch, schedule, status, fullName, phone, employeeId } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Username, password, and role are required' });
    }
    if (role === 'developer' && req.user.role !== 'developer') {
      return res.status(403).json({ error: 'Access denied: cannot create developer user' });
    }
    
    // Strict scoping for branch admins
    const { role: userRole, branch: userBranch } = req.user;
    if (userRole === 'branchadmin') {
      if (role !== 'trainer') {
        return res.status(403).json({ error: 'Access denied: Branch admins can only create trainers.' });
      }
      if (!branch || String(branch).toLowerCase().trim() !== userBranch.toLowerCase().trim()) {
        return res.status(403).json({ error: 'Access denied: Cannot create trainer for another branch.' });
      }
    }

    let resolvedBranch = branch || '';
    let resolvedBatch = batch || '';
    let resolvedSchedule = schedule || '';

    if (role === 'superadmin' || role === 'branchadmin' || role === 'trainer') {
      if (!branch || !batch) {
        return res.status(400).json({ error: 'Branch and Batch are required' });
      }
      const dbBatch = await validateBranchBatchMapping(branch, batch);
      if (!dbBatch) {
        return res.status(400).json({ error: `Selected batch '${batch}' is not actively mapped to the branch '${branch}'` });
      }
      resolvedBranch = dbBatch.branchName;
      resolvedBatch = dbBatch.code;
      resolvedSchedule = dbBatch.schedule;
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
      branch: resolvedBranch,
      batch: resolvedBatch,
      schedule: resolvedSchedule,
      status: status || 'Active',
      fullName: fullName || '',
      phone: phone || '',
      employeeId: employeeId || '',
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
        const key = resolvedBranch || 'Kuttiady';
        const entry = { username: cleanUser, password };
        if (creds.branchCredentials instanceof Map) {
          creds.branchCredentials.set(key, entry);
        } else {
          creds.branchCredentials[key] = entry;
        }
      } else if (role === 'trainer') {
        const key = `${resolvedBranch || 'Kuttiady'}_${resolvedBatch || 'batch1'}`;
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

app.put('/api/admins/:id', authenticateSession, authorizeRoles('superadmin', 'developer'), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role, branch, batch, schedule, status, fullName, phone, employeeId, isLocked } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'Admin user not found' });

    if (user.role === 'developer' && req.user.role !== 'developer') {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }
    if (role === 'developer' && req.user.role !== 'developer') {
      return res.status(403).json({ error: 'Access denied: cannot assign developer role' });
    }

    // Strict scoping for branch admins
    if (req.user.role === 'branchadmin') {
      if (user.role !== 'trainer' || user.branch.toLowerCase().trim() !== req.user.branch.toLowerCase().trim()) {
        return res.status(403).json({ error: 'Access denied: Cannot modify admin/trainer from another branch or role.' });
      }
      if (role && role !== 'trainer') {
        return res.status(403).json({ error: 'Access denied: Cannot change trainer to another role.' });
      }
      if (branch && branch.toLowerCase().trim() !== req.user.branch.toLowerCase().trim()) {
        return res.status(403).json({ error: 'Access denied: Cannot change trainer branch.' });
      }
    }

    const oldUsername = user.username;
    const oldRole = user.role;
    const oldBranch = user.branch;
    const oldBatch = user.batch;

    const targetRole = role || user.role;
    const targetBranch = branch !== undefined ? branch : user.branch;
    const targetBatch = batch !== undefined ? batch : user.batch;

    if (targetRole === 'superadmin' || targetRole === 'branchadmin' || targetRole === 'trainer') {
      if (!targetBranch || !targetBatch) {
        return res.status(400).json({ error: 'Branch and Batch are required' });
      }
      const dbBatch = await validateBranchBatchMapping(targetBranch, targetBatch);
      if (!dbBatch) {
        return res.status(400).json({ error: `Selected batch '${targetBatch}' is not actively mapped to the branch '${targetBranch}'` });
      }
      user.branch = dbBatch.branchName;
      user.batch = dbBatch.code;
      user.schedule = schedule !== undefined ? schedule : dbBatch.schedule;
    } else {
      if (branch !== undefined) user.branch = branch;
      if (batch !== undefined) user.batch = batch;
      if (schedule !== undefined) user.schedule = schedule;
    }

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
        } else if (oldRole === 'trainer') {
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
      } else if (oldRole === 'trainer') {
        const key = `${oldBranch}_${oldBatch}`;
        if (creds.batchCredentials instanceof Map) creds.batchCredentials.delete(key);
        else delete creds.batchCredentials[key];
      }

      // Insert new mapping if status is Active
      if (user.status === 'Active') {
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
        } else if (newRole === 'trainer') {
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

app.delete('/api/admins/:id', authenticateSession, authorizeRoles('superadmin', 'developer'), async (req, res) => {
  try {
    const { id } = req.params;
    const isPermanent = req.query.permanent === 'true';
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'Admin user not found' });

    if (user.role === 'developer' && req.user.role !== 'developer') {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }

    // Strict scoping for branch admins
    if (req.user.role === 'branchadmin') {
      if (user.role !== 'trainer' || user.branch.toLowerCase().trim() !== req.user.branch.toLowerCase().trim()) {
        return res.status(403).json({ error: 'Access denied: Cannot delete admin/trainer from another branch or role.' });
      }
    }

    const uName = user.username;
    const uRole = user.role;
    const uBranch = user.branch;
    const uBatch = user.batch;

    if (isPermanent) {
      await User.findByIdAndDelete(id);
    } else {
      user.status = 'SoftDeleted';
      await user.save();
    }

    // Delete from credentials mapping
    const creds = await Credential.findOne({ configType: 'main' });
    if (creds) {
      if (uRole === 'superadmin') {
        if (creds.adminCredentials instanceof Map) creds.adminCredentials.delete(uName);
        else delete creds.adminCredentials[uName];
      } else if (uRole === 'branchadmin') {
        if (creds.branchCredentials instanceof Map) creds.branchCredentials.delete(uBranch);
        else delete creds.branchCredentials[uBranch];
      } else if (uRole === 'trainer') {
        const batches = String(uBatch || '').split(',').map(b => b.trim()).filter(Boolean);
        for (const bt of batches) {
          const key = `${uBranch}_${bt}`;
          if (creds.batchCredentials instanceof Map) creds.batchCredentials.delete(key);
          else delete creds.batchCredentials[key];
        }
      }
      creds.markModified('adminCredentials');
      creds.markModified('branchCredentials');
      creds.markModified('batchCredentials');
      await creds.save();
    }

    await new SecurityLog({
      eventType: isPermanent ? 'UserPermanentDelete' : 'DeveloperAudit',
      username: req.user.username,
      description: isPermanent ? `Permanently deleted Admin account: ${uName}` : `Soft deleted Admin account: ${uName}`,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent']
    }).save();

    res.json({ success: true, message: isPermanent ? 'Admin permanently deleted successfully' : 'Admin soft deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admins/:id/details', authenticateSession, authorizeRoles('superadmin', 'developer'), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.role === 'developer' && req.user.role !== 'developer') {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }

    // Strict scoping for branch admins
    if (req.user.role === 'branchadmin') {
      if (user.role !== 'trainer' || user.branch.toLowerCase().trim() !== req.user.branch.toLowerCase().trim()) {
        return res.status(403).json({ error: 'Access denied: Cannot view details of admin/trainer from another branch or role.' });
      }
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

// Fetch all help reports (tickets) (paginated and sorted)
developerRouter.get('/help-reports', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    
    const count = await HelpReport.countDocuments({});
    const reports = await HelpReport.find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
      
    res.json({
      reports,
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

// Update help report status (Pending/Resolved)
developerRouter.put('/help-reports/:id/status', async (req, res) => {
  try {
    const { status, developerReply } = req.body;
    if (!['Pending', 'Resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const updateData = { status };
    if (status === 'Resolved') {
      updateData.developerReply = developerReply || '';
      updateData.resolvedAt = new Date();
    } else {
      updateData.developerReply = '';
      updateData.resolvedAt = null;
    }
    const updated = await HelpReport.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: 'Help report not found' });
    res.json({ success: true, report: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a help report
developerRouter.delete('/help-reports/:id', async (req, res) => {
  try {
    const deleted = await HelpReport.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Help report not found' });
    res.json({ success: true, message: 'Help report deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api/developer', developerRouter);

app.listen(PORT, () => {
  console.log(`Express server is running on port ${PORT}`);
});
// Nodemon reload trigger 1
