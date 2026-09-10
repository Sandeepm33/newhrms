'use client';

import { useState } from 'react';
import {
  Clock,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Download,
  Check,
  X,
  ArrowUpRight,
} from 'lucide-react';

export default function AttendancePage() {
  const [clockedIn, setClockedIn] = useState(false);
  const [clockTime, setClockTime] = useState<string | null>(null);

  const sampleAttendance = [
    { id: '1', emp: 'Rahul Sharma', code: 'EMP-001', checkIn: '09:02 AM', checkOut: '06:05 PM', status: 'PRESENT', hours: '9h 03m' },
    { id: '2', emp: 'Priya Patel', code: 'EMP-002', checkIn: '09:45 AM', checkOut: '06:30 PM', status: 'LATE', hours: '8h 45m' },
    { id: '3', emp: 'Ankit Verma', code: 'EMP-003', checkIn: '-', checkOut: '-', status: 'ON_LEAVE', hours: '0h 00m' },
    { id: '4', emp: 'Sneha Gupta', code: 'EMP-004', checkIn: '08:55 AM', checkOut: '06:00 PM', status: 'PRESENT', hours: '9h 05m' },
    { id: '5', emp: 'Vikram Singh', code: 'EMP-005', checkIn: '10:15 AM', checkOut: '-', status: 'HALF_DAY', hours: '4h 15m' },
  ];

  function handleClockToggle() {
    if (!clockedIn) {
      setClockedIn(true);
      setClockTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } else {
      setClockedIn(false);
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header & Quick Clock-in */}
      <div
        className="glass-card"
        style={{
          padding: 28,
          marginBottom: 28,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(16,185,129,0.08) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Clock size={26} color="#6366f1" />
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Attendance & Time Tracking
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14 }}>
            Real-time biometric sync, shift rosters, and daily attendance logs
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {clockedIn && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Clocked in at</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>{clockTime}</div>
            </div>
          )}
          <button
            onClick={handleClockToggle}
            className="btn"
            style={{
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 700,
              background: clockedIn ? '#ef4444' : 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              boxShadow: clockedIn ? '0 4px 14px rgba(239,68,68,0.3)' : '0 4px 14px rgba(16,185,129,0.3)',
              cursor: 'pointer',
            }}
          >
            {clockedIn ? 'Clock Out' : 'Web Punch Clock-In'}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 28 }}>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Present Today</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={20} color="#10b981" /> 482 / 512
          </div>
          <span style={{ fontSize: 11, color: '#10b981', marginTop: 4, display: 'inline-block' }}>94.1% Attendance Rate</span>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>On Leave / WFH</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarCheck size={20} color="#6366f1" /> 24
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'inline-block' }}>Approved Absences</span>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Late Arrivals</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={20} color="#f59e0b" /> 6
          </div>
          <span style={{ fontSize: 11, color: '#f59e0b', marginTop: 4, display: 'inline-block' }}>Grace time applied</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Daily Attendance Log (Today)
          </h3>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ position: 'relative', width: 260 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" className="form-input" placeholder="Search employee..." style={{ paddingLeft: 32, fontSize: 13 }} />
            </div>
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <Filter size={14} /> Filter
            </button>
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-muted)', fontSize: 12 }}>
                <th style={{ padding: '12px 16px' }}>Employee</th>
                <th style={{ padding: '12px 16px' }}>Code</th>
                <th style={{ padding: '12px 16px' }}>Check In</th>
                <th style={{ padding: '12px 16px' }}>Check Out</th>
                <th style={{ padding: '12px 16px' }}>Work Hours</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {sampleAttendance.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{row.emp}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: 'var(--brand-400)' }}>{row.code}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.checkIn}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.checkOut}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{row.hours}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        background:
                          row.status === 'PRESENT'
                            ? 'rgba(16,185,129,0.15)'
                            : row.status === 'LATE'
                            ? 'rgba(245,158,11,0.15)'
                            : 'rgba(99,102,241,0.15)',
                        color:
                          row.status === 'PRESENT'
                            ? '#10b981'
                            : row.status === 'LATE'
                            ? '#f59e0b'
                            : '#6366f1',
                      }}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
