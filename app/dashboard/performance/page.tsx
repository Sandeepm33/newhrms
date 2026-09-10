'use client';

import { useState } from 'react';
import {
  Target,
  Plus,
  Star,
  Award,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';

export default function PerformancePage() {
  const reviews = [
    { id: '1', emp: 'Rahul Sharma', cycle: 'H1 2026 Annual Review', rating: 4.5, reviewer: 'Manager: Ankit V.', status: 'COMPLETED' },
    { id: '2', emp: 'Priya Patel', cycle: 'H1 2026 Annual Review', rating: 4.8, reviewer: 'Manager: Sandeep M.', status: 'COMPLETED' },
    { id: '3', emp: 'Karan Malhotra', cycle: 'H1 2026 Annual Review', rating: 0, reviewer: 'Self Assessment', status: 'IN_PROGRESS' },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        className="glass-card"
        style={{
          padding: 28,
          marginBottom: 28,
          background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(99,102,241,0.08) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Target size={26} color="#f59e0b" />
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Performance, OKRs & 360° Reviews
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14 }}>
            Track goals, quarterly performance review cycles, and peer continuous feedback
          </p>
        </div>

        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Create Review Cycle
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 28 }}>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Active Review Cycle</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>H1 2026 Appraisal</div>
          <span style={{ fontSize: 11, color: '#10b981', marginTop: 4, display: 'inline-block' }}>88% Submission Rate</span>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Company OKR Progress</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>78.4%</div>
          <span style={{ fontSize: 11, color: 'var(--brand-400)', marginTop: 4, display: 'inline-block' }}>On track for Q3</span>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Avg Org Performance Rating</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Star size={20} color="#f59e0b" fill="#f59e0b" /> 4.2 / 5.0
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'inline-block' }}>Based on 420 reviews</span>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
          Performance Reviews Status
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-muted)', fontSize: 12 }}>
                <th style={{ padding: '12px 16px' }}>Employee</th>
                <th style={{ padding: '12px 16px' }}>Review Cycle</th>
                <th style={{ padding: '12px 16px' }}>Stage / Reviewer</th>
                <th style={{ padding: '12px 16px' }}>Rating</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{r.emp}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{r.cycle}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{r.reviewer}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#f59e0b' }}>
                    {r.rating > 0 ? `★ ${r.rating}` : '-'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        background: r.status === 'COMPLETED' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                        color: r.status === 'COMPLETED' ? '#10b981' : '#f59e0b',
                      }}
                    >
                      {r.status}
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
