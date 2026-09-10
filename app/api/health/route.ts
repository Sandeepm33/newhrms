// ============================================================
// HRMS — Health Check API
// Used by monitoring / deployment checks
// ============================================================

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  } catch {
    return NextResponse.json(
      { status: 'error', database: 'disconnected', timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}
