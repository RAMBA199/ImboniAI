import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

export async function connectDB(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is not set. Set process.env.MONGO_URI or add it to your .env file.');
  }

  const maxAttempts = 10;
  const delayMs = 2000;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      console.log(`🔌 Connecting to MongoDB at ${mongoUri} (attempt ${attempt}/${maxAttempts})`);
      await mongoose.connect(mongoUri);
      console.log('✅ MongoDB connected successfully');
      return;
    } catch (error: any) {
      console.error(`❌ MongoDB connection failed on attempt ${attempt}:`, error?.message || error);
      if (attempt === maxAttempts) {
        throw error;
      }
      console.log(`⏳ Retrying MongoDB connection in ${delayMs / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

export async function testConnection(): Promise<void> {
  await connectDB();
}

// Demo user management
export async function getOrCreateDemoUser() {
  const db = mongoose.connection.db;
  if (!db) throw new Error('Database not connected');

  const users = db.collection('users');
  const existingUser = await users.findOne({ _id: 'demo-user' } as any);

  if (existingUser) {
    return existingUser;
  }

  const demoUser = {
    _id: 'demo-user',
    name: 'Demo User',
    preferences: ['food', 'coffee'],
    createdAt: new Date()
  };

  await users.insertOne(demoUser as any);
  return demoUser;
}
