'use client';

import { useState, useEffect } from 'react';
import {
  Clock,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Download,
  Users,
  MapPin,
  RefreshCw,
} from 'lucide-react';

interface AttendanceRecord {
  _id: string;
  employee: {
    code: string;
    name: string;
  };
  date: string;
  clockIn?: string;
  clockOut?: string;
  totalHours: number;
  status: string;
  notes?: string;
}

interface AttendanceStats {
  totalEmployees: number;
  presentCount: number;
  lateCount: number;
  onLeaveCount: number;
  absentCount: number;
  attendancePercentage: number;
}

export default function AttendancePage() {
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [clocking, setClocking] = useState(false);
  const [clockedIn, setClockedIn] = useState(false);
  const [clockTime, setClockTime] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resAtt, resStats] = await Promise.all([
        fetch(`/api/attendance?date=${selectedDate}`),
        fetch(`/api/attendance/stats`),
      ]);

      const dataAtt = await resAtt.json();
      const dataStats = await resStats.json();

      if (dataAtt.success) {
        setAttendances(dataAtt.data);
        // Check if current user has clocked in today
        const todayRecord = dataAtt.data.find((a: AttendanceRecord) => a.clockIn && !a.clockOut);
        if (todayRecord) {
          setClockedIn(true);
          setClockTime(new Date(todayRecord.clockIn!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } else {
          setClockedIn(false);
        }
      }

      if (dataStats.success) {
        setStats(dataStats.data);
      }
    } catch (err) {
      console.error('Failed to fetch attendance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClockToggle = async () => {
    setClocking(true);
    try {
      const action = clockedIn ? 'CLOCK_OUT' : 'CLOCK_IN';
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.message || 'Action failed');
      }
    } catch (err) {
      console.error('Clock action failed:', err);
    } finally {
      setClocking(false);
    }
  };

  const filteredAttendances = attendances.filter(
    (a) =>
      a.employee.name.toLowerCase().includes(search.toLowerCase()) ||
      a.employee.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
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
            Real-time web punch, biometric log sync, and attendance management
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
            disabled={clocking}
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
            {clocking ? 'Processing...' : clockedIn ? 'Clock Out' : 'Web Punch Clock-In'}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 28 }}>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Present Today</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={20} color="#10b981" /> {stats?.presentCount ?? 0} / {stats?.totalEmployees ?? 0}
          </div>
          <span style={{ fontSize: 11, color: '#10b981', marginTop: 4, display: 'inline-block' }}>
            {stats?.attendancePercentage ?? 0}% Attendance Rate
          </span>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>On Leave</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarCheck size={20} color="#6366f1" /> {stats?.onLeaveCount ?? 0}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'inline-block' }}>Approved Absences</span>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Late Arrivals</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={20} color="#f59e0b" /> {stats?.lateCount ?? 0}
          </div>
          <span style={{ fontSize: 11, color: '#f59e0b', marginTop: 4, display: 'inline-block' }}>Past 10:00 AM Threshold</span>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Absent</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={20} color="#ef4444" /> {stats?.absentCount ?? 0}
          </div>
          <span style={{ fontSize: 11, color: '#ef4444', marginTop: 4, display: 'inline-block' }}>Unexplained Absences</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Daily Attendance Log
          </h3>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ padding: '6px 12px', fontSize: 13 }}
            />
            <div style={{ position: 'relative', width: 220 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 32, fontSize: 13 }}
              />
            </div>
            <button onClick={fetchData} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading attendance logs...</div>
        ) : filteredAttendances.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            No attendance records found for this date.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-muted)', fontSize: 12 }}>
                  <th style={{ padding: '12px 16px' }}>Employee</th>
                  <th style={{ padding: '12px 16px' }}>Code</th>
                  <th style={{ padding: '12px 16px' }}>Clock In</th>
                  <th style={{ padding: '12px 16px' }}>Clock Out</th>
                  <th style={{ padding: '12px 16px' }}>Total Hours</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendances.map((row) => (
                  <tr key={row._id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{row.employee.name}</td>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: 'var(--brand-400)' }}>{row.employee.code}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {row.clockIn ? new Date(row.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {row.clockOut ? new Date(row.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {row.totalHours ? `${row.totalHours} hrs` : '-'}
                    </td>
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
        )}
      </div>
    </div>
  );
}
