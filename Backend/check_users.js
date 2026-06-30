import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB.');

  const allUsers = await User.find({}).lean();
  console.log('--- ALL USERS ---');
  allUsers.forEach(u => {
    console.log(`Username: ${u.username}, Role: ${u.role}, Branch: ${u.branch}, Batch: ${u.batch}, Status: ${u.status}`);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
