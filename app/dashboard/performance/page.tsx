'use client';

import { useState, useEffect } from 'react';
import { Target, Plus, RefreshCw, CheckCircle2, Clock } from 'lucide-react';

interface PerfCycleItem {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  participantsCount: number;
  completionRate: number;
  description?: string;
}

export default function PerformancePage() {
  const [cycles, setCycles] = useState<PerfCycleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchCycles();
  }, []);

  const fetchCycles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/performance');
      const data = await res.json();
      if (data.success) {
        setCycles(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load performance cycles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCycle = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, startDate, endDate, description }),
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setName('');
        fetchCycles();
      }
    } catch (err) {
      console.error('Failed to create cycle:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header */}
      <div
        className="glass-card"
        style={{
          padding: 28,
          marginBottom: 28,
          background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(99,102,241,0.08) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Target size={26} color="#8b5cf6" />
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Performance & OKRs
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14 }}>
            Manage performance review cycles, employee goals, and feedback appraisals
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px' }}
        >
          <Plus size={16} /> Create Review Cycle
        </button>
      </div>

      {/* Cycles Grid */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Appraisal Review Cycles
        </h2>
        <button onClick={fetchCycles} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading appraisal cycles...</div>
      ) : cycles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No appraisal cycles found.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {cycles.map((cyc) => (
            <div key={cyc._id} className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {cyc.name}
                </h3>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    background: cyc.status === 'ACTIVE' ? 'rgba(139,92,246,0.15)' : 'rgba(16,185,129,0.15)',
                    color: cyc.status === 'ACTIVE' ? '#8b5cf6' : '#10b981',
                  }}
                >
                  {cyc.status}
                </span>
              </div>

              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.4 }}>
                {cyc.description || 'Appraisal review cycle'}
              </p>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                  <span>Completion Rate</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{cyc.completionRate}%</span>
                </div>
                <div style={{ height: 6, width: '100%', background: 'var(--surface-border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${cyc.completionRate}%`, background: '#8b5cf6', borderRadius: 3 }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                <span>Participants: {cyc.participantsCount}</span>
                <span>{new Date(cyc.startDate).toLocaleDateString('en-GB')} - {new Date(cyc.endDate).toLocaleDateString('en-GB')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 480, padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
              Create Review Cycle
            </h2>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Cycle Name</label>
              <input type="text" className="form-input" placeholder="e.g. Q4 Appraisal 2026" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label className="form-label">Start Date</label>
                <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="form-label">End Date</label>
                <input type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={3} placeholder="Details about this performance cycle..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleCreateCycle} disabled={submitting} className="btn btn-primary">{submitting ? 'Creating...' : 'Create Cycle'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
