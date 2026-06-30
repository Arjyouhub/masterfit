import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Branch from './models/Branch.js';
import Batch from './models/Batch.js';
import Student from './models/Student.js';
import Class from './models/Class.js';
import Attendance from './models/Attendance.js';
import Credential from './models/Credential.js';
import User from './models/User.js';
import Session from './models/Session.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB. Starting cleanup...');

  // 1. Delete transactional collections
  const branchRes = await Branch.deleteMany({});
  console.log(`Deleted ${branchRes.deletedCount} branches.`);

  const batchRes = await Batch.deleteMany({});
  console.log(`Deleted ${batchRes.deletedCount} batches.`);

  const studentRes = await Student.deleteMany({});
  console.log(`Deleted ${studentRes.deletedCount} students.`);

  const classRes = await Class.deleteMany({});
  console.log(`Deleted ${classRes.deletedCount} classes.`);

  const attendanceRes = await Attendance.deleteMany({});
  console.log(`Deleted ${attendanceRes.deletedCount} attendance records.`);

  const sessionRes = await Session.deleteMany({});
  console.log(`Deleted ${sessionRes.deletedCount} active user sessions.`);

  // 2. Reset Credential configuration document
  const creds = await Credential.findOne({ configType: 'main' });
  if (creds) {
    creds.branchCredentials = new Map();
    creds.batchCredentials = new Map();
    creds.customBranches = [];
    creds.customBatches = [];
    creds.markModified('branchCredentials');
    creds.markModified('batchCredentials');
    creds.markModified('customBranches');
    creds.markModified('customBatches');
    await creds.save();
    console.log('Cleared custom branches, custom batches, and branch/batch credentials in Credential document.');
  }

  // 3. Clear non-admin users
  const userRes = await User.deleteMany({ role: { $nin: ['superadmin', 'developer'] } });
  console.log(`Deleted ${userRes.deletedCount} branch admin/trainer user accounts.`);

  console.log('Database cleanup completed successfully!');
  await mongoose.disconnect();
}

run().catch(console.error);
