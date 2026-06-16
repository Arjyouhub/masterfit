import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI, { dbName: 'attendance' })
  .then(async () => {
    const creds = await mongoose.connection.db.collection('credentials').findOne({ configType: 'main' });
    console.log('Branch keys:', Object.keys(creds.branchCredentials || {}));
    console.log('Batch keys:', Object.keys(creds.batchCredentials || {}));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
