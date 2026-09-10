'use client';

import { useState } from 'react';
import {
  CalendarOff,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  Calendar,
} from 'lucide-react';

export default function LeavePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('CASUAL');
  const [reason, setReason] = useState('');

  const leaveBalances = [
    { type: 'Casual Leave (CL)', allocated: 12, used: 4, remaining: 8, color: '#6366f1' },
    { type: 'Sick Leave (SL)', allocated: 10, used: 2, remaining: 8, color: '#ec4899' },
    { type: 'Privilege Leave (PL)', allocated: 18, used: 5, remaining: 13, color: '#10b981' },
    { type: 'Maternity/Paternity', allocated: 26, used: 0, remaining: 26, color: '#f59e0b' },
  ];

  const recentRequests = [
    { id: '1', emp: 'Meera Iyer', type: 'Casual Leave', dates: '12 Sep - 14 Sep (3 days)', status: 'PENDING', manager: 'Sandeep Sharma' },
    { id: '2', emp: 'Karan Malhotra', type: 'Sick Leave', dates: '05 Sep (1 day)', status: 'APPROVED', manager: 'Sandeep Sharma' },
    { id: '3', emp: 'Neha Singh', type: 'Privilege Leave', dates: '20 Aug - 25 Aug (5 days)', status: 'APPROVED', manager: 'Sandeep Sharma' },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        className="glass-card"
        style={{
          padding: 28,
          marginBottom: 28,
          background: 'linear-gradient(135deg, rgba(236,72,153,0.12) 0%, rgba(99,102,241,0.08) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <CalendarOff size={26} color="#ec4899" />
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Leave Management
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14 }}>
            Track leave balances, submit leave requests, and manage approvals
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px' }}
        >
          <Plus size={16} /> Apply for Leave
        </button>
      </div>

      {/* Leave Balances Grid */}
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
        Your Leave Balances (2026)
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
        {leaveBalances.map((bal) => (
          <div key={bal.type} className="glass-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{bal.type}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: bal.color, background: `${bal.color}15`, padding: '2px 8px', borderRadius: 4 }}>
                {bal.remaining} days left
              </span>
            </div>
            <div style={{ height: 6, width: '100%', background: 'var(--surface-border)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ height: '100%', width: `${(bal.used / bal.allocated) * 100}%`, background: bal.color, borderRadius: 3 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
              <span>Used: {bal.used}d</span>
              <span>Total: {bal.allocated}d</span>
            </div>
          </div>
        ))}
      </div>

      {/* Leave Requests Table */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
          Recent Leave Applications
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-muted)', fontSize: 12 }}>
                <th style={{ padding: '12px 16px' }}>Applicant</th>
                <th style={{ padding: '12px 16px' }}>Leave Type</th>
                <th style={{ padding: '12px 16px' }}>Duration</th>
                <th style={{ padding: '12px 16px' }}>Approver</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.map((req) => (
                <tr key={req.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{req.emp}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{req.type}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{req.dates}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{req.manager}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        background:
                          req.status === 'APPROVED' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                        color: req.status === 'APPROVED' ? '#10b981' : '#f59e0b',
                      }}
                    >
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20,
          }}
        >
          <div className="glass-card" style={{ width: '100%', maxWidth: 480, padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
              Apply for Leave
            </h2>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Leave Type</label>
              <select
                className="form-input"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
              >
                <option value="CASUAL">Casual Leave (CL)</option>
                <option value="SICK">Sick Leave (SL)</option>
                <option value="PRIVILEGE">Privilege Leave (PL)</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label className="form-label">Start Date</label>
                <input type="date" className="form-input" defaultValue="2026-09-15" />
              </div>
              <div>
                <label className="form-label">End Date</label>
                <input type="date" className="form-input" defaultValue="2026-09-16" />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label className="form-label">Reason</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Reason for leave request..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={() => setModalOpen(false)} className="btn btn-primary">
                Submit Leave Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
