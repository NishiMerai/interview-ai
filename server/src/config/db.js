import mongoose from 'mongoose';

mongoose.set('bufferCommands', false);

export function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}

export async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.warn('MONGO_URI is missing. API will start in development fallback mode.');
    return;
  }

  try {
    await mongoose.connect(uri, {
      autoIndex: process.env.NODE_ENV !== 'production',
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    console.warn('Continuing with in-memory demo mode for auth/admin.');
  }
}
