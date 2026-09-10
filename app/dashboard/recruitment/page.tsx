'use client';

import { useState } from 'react';
import {
  UserPlus,
  Briefcase,
  Users,
  Calendar,
  FileCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
} from 'lucide-react';

export default function RecruitmentPage() {
  const jobs = [
    { id: '1', title: 'Senior Full Stack Engineer', dept: 'Engineering', loc: 'Mumbai HQ', applicants: 42, stage: 'INTERVIEW', status: 'ACTIVE' },
    { id: '2', title: 'HR Operations Lead', dept: 'Human Resources', loc: 'Bangalore Office', applicants: 28, stage: 'SCREENING', status: 'ACTIVE' },
    { id: '3', title: 'Product Designer (UI/UX)', dept: 'Design', loc: 'Remote', applicants: 64, stage: 'OFFER_RELEASED', status: 'ACTIVE' },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        className="glass-card"
        style={{
          padding: 28,
          marginBottom: 28,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <UserPlus size={26} color="#6366f1" />
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Recruitment & Candidate Pipeline
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14 }}>
            Manage job requisitions, candidate ATS pipeline, interview scheduling, and offer letters
          </p>
        </div>

        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Post New Job
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 28 }}>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Open Requisitions</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>14 Jobs</div>
          <span style={{ fontSize: 11, color: '#10b981', marginTop: 4, display: 'inline-block' }}>Across 5 Departments</span>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Total Active Applicants</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>134 Candidates</div>
          <span style={{ fontSize: 11, color: 'var(--brand-400)', marginTop: 4, display: 'inline-block' }}>32 Interviews this week</span>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Offers Accepted</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>8 Offers</div>
          <span style={{ fontSize: 11, color: '#10b981', marginTop: 4, display: 'inline-block' }}>Joining next month</span>
        </div>
      </div>

      {/* Active Jobs Table */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Active Job Openings
          </h3>
          <div style={{ position: 'relative', width: 260 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" className="form-input" placeholder="Search jobs..." style={{ paddingLeft: 32, fontSize: 13 }} />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-muted)', fontSize: 12 }}>
                <th style={{ padding: '12px 16px' }}>Job Position</th>
                <th style={{ padding: '12px 16px' }}>Department</th>
                <th style={{ padding: '12px 16px' }}>Location</th>
                <th style={{ padding: '12px 16px' }}>Applicants</th>
                <th style={{ padding: '12px 16px' }}>Pipeline Status</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{job.title}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{job.dept}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{job.loc}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--brand-400)' }}>{job.applicants} candidates</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(99,102,241,0.15)', color: 'var(--brand-400)' }}>
                      {job.stage}
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
