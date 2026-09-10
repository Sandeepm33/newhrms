// ============================================================
// HRMS — MongoDB Connection (Singleton / Cached)
// Never creates a new connection per request in Next.js
// ============================================================

import mongoose from 'mongoose';

const MONGODB_URI = process.env['MONGODB_URI'];

if (!MONGODB_URI) {
  throw new Error(
    'MONGODB_URI is not defined in environment variables. ' +
    'Create a .env.local file based on .env.example.'
  );
}

// Extend the NodeJS global type to cache the connection
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const cached = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      dbName: process.env['MONGODB_DB_NAME'] ?? 'hrms',
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI as string, opts)
      .then((mongooseInstance) => {
        console.log('[MongoDB] Connected to Atlas');
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        console.error('[MongoDB] Connection failed:', err);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

export default connectDB;
