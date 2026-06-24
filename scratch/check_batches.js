import mongoose from 'mongoose';

const mongoUri = "mongodb+srv://abhijinkm35_db:WuT9su!s.vfFH7n@cluster0.rcm7njg.mongodb.net/attendance?appName=Cluster0";

async function check() {
  await mongoose.connect(mongoUri, { dbName: 'attendance' });
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));

  const batches = await db.collection('batches').find({}).toArray();
  console.log('Number of batches:', batches.length);
  console.log('Sample Batch Document:', JSON.stringify(batches[0], null, 2));
  console.log('Sample Batch keys:', Object.keys(batches[0] || {}));
  console.log('All unique branches in batches:', Array.from(new Set(batches.map(b => b.branch))));
  
  await mongoose.disconnect();
}

check().catch(console.error);
