'use client';

import { useState, useEffect } from 'react';
import {
  CalendarOff,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  X,
  RefreshCw,
  Filter,
} from 'lucide-react';

interface LeaveTypeItem {
  _id: string;
  name: string;
  code: string;
  daysPerYear: number;
}

interface LeaveBalanceItem {
  _id: string;
  leaveTypeId: string;
  allocatedDays: number;
  usedDays: number;
  remainingDays: number;
  leaveType: {
    name: string;
    code: string;
  };
}

interface LeaveRequestItem {
  _id: string;
  employee: {
    code: string;
    name: string;
  };
  leaveType: {
    name: string;
    code: string;
  };
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
}

export default function LeavePage() {
  const [requests, setRequests] = useState<LeaveRequestItem[]>([]);
  const [balances, setBalances] = useState<LeaveBalanceItem[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Form State
  const [selectedLeaveType, setSelectedLeaveType] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchLeaveData();
  }, [statusFilter]);

  const fetchLeaveData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leave?status=${statusFilter}`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.data.requests || []);
        setBalances(data.data.balances || []);
        setLeaveTypes(data.data.leaveTypes || []);
        if (data.data.leaveTypes?.length > 0 && !selectedLeaveType) {
          setSelectedLeaveType(data.data.leaveTypes[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch leave data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for the leave request.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaveTypeId: selectedLeaveType,
          startDate,
          endDate,
          isHalfDay,
          reason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setReason('');
        fetchLeaveData();
      } else {
        alert(data.message || 'Failed to submit request');
      }
    } catch (err) {
      console.error('Failed to apply leave:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/leave', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status }),
      });

      const data = await res.json();
      if (data.success) {
        fetchLeaveData();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const COLOR_PALETTE = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
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
            Track leave balances, submit leave requests, and manage manager approvals
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
        Your Leave Balances ({new Date().getFullYear()})
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
        {balances.length === 0 ? (
          <div className="glass-card" style={{ padding: 20, color: 'var(--text-muted)' }}>
            No leave balances set up yet.
          </div>
        ) : (
          balances.map((bal, idx) => {
            const color = COLOR_PALETTE[idx % COLOR_PALETTE.length];
            const pct = bal.allocatedDays > 0 ? (bal.usedDays / bal.allocatedDays) * 100 : 0;
            return (
              <div key={bal._id} className="glass-card" style={{ padding: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {bal.leaveType?.name} ({bal.leaveType?.code})
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, color, background: `${color}15`, padding: '2px 8px', borderRadius: 4 }}>
                    {bal.remainingDays} days left
                  </span>
                </div>
                <div style={{ height: 6, width: '100%', background: 'var(--surface-border)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>Used: {bal.usedDays}d</span>
                  <span>Total: {bal.allocatedDays}d</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Leave Requests Table */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Leave Applications
          </h3>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 6, background: 'var(--surface-elevated)', padding: 4, borderRadius: 8, border: '1px solid var(--surface-border)' }}>
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: '4px 12px',
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 6,
                    border: 'none',
                    cursor: 'pointer',
                    background: statusFilter === st ? 'var(--brand-500)' : 'transparent',
                    color: statusFilter === st ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {st}
                </button>
              ))}
            </div>

            <button onClick={fetchLeaveData} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading leave requests...</div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No leave applications found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-muted)', fontSize: 12 }}>
                  <th style={{ padding: '12px 16px' }}>Applicant</th>
                  <th style={{ padding: '12px 16px' }}>Type</th>
                  <th style={{ padding: '12px 16px' }}>Dates & Duration</th>
                  <th style={{ padding: '12px 16px' }}>Reason</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req._id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {req.employee.name} ({req.employee.code})
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{req.leaveType?.name}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {new Date(req.startDate).toLocaleDateString('en-GB')} - {new Date(req.endDate).toLocaleDateString('en-GB')} ({req.totalDays}d)
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {req.reason}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          background:
                            req.status === 'APPROVED'
                              ? 'rgba(16,185,129,0.15)'
                              : req.status === 'REJECTED'
                              ? 'rgba(239,68,68,0.15)'
                              : 'rgba(245,158,11,0.15)',
                          color:
                            req.status === 'APPROVED'
                              ? '#10b981'
                              : req.status === 'REJECTED'
                              ? '#ef4444'
                              : '#f59e0b',
                        }}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      {req.status === 'PENDING' && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                          <button
                            onClick={() => handleUpdateStatus(req._id, 'APPROVED')}
                            className="btn btn-primary"
                            style={{ padding: '4px 10px', fontSize: 11, background: '#10b981', borderColor: '#10b981' }}
                          >
                            <Check size={12} /> Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(req._id, 'REJECTED')}
                            className="btn btn-danger"
                            style={{ padding: '4px 10px', fontSize: 11 }}
                          >
                            <X size={12} /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
                value={selectedLeaveType}
                onChange={(e) => setSelectedLeaveType(e.target.value)}
              >
                {leaveTypes.map((lt) => (
                  <option key={lt._id} value={lt._id}>
                    {lt.name} ({lt.code})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                id="halfDayToggle"
                checked={isHalfDay}
                onChange={(e) => setIsHalfDay(e.target.checked)}
              />
              <label htmlFor="halfDayToggle" style={{ fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer' }}>
                Apply as Half-Day
              </label>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label className="form-label">Reason</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="State the reason for your leave request..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleApplyLeave} disabled={submitting} className="btn btn-primary">
                {submitting ? 'Submitting...' : 'Submit Leave Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
