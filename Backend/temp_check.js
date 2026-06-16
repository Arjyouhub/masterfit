import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI, { dbName: 'attendance' })
  .then(async () => {
    const creds = await mongoose.connection.db.collection('credentials').findOne({ configType: 'main' });
    console.log('Credentials document configType main:', JSON.stringify(creds, null, 2));
    
    // Also fetch sessions
    const sessions = await mongoose.connection.db.collection('sessions').find().toArray();
    console.log('Sessions:', JSON.stringify(sessions, null, 2));
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
