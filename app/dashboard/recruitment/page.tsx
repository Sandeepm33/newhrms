'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Plus, Briefcase, MapPin, Users, RefreshCw } from 'lucide-react';

interface JobItem {
  _id: string;
  title: string;
  department: string;
  location: string;
  openingsCount: number;
  applicantsCount: number;
  status: string;
  postedDate: string;
}

interface RecruitmentStats {
  activeJobs: number;
  totalOpenings: number;
  totalApplicants: number;
}

export default function RecruitmentPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [stats, setStats] = useState<RecruitmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('Headquarters');
  const [openingsCount, setOpeningsCount] = useState(1);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recruitment');
      const data = await res.json();
      if (data.success) {
        setJobs(data.data.jobs || []);
        setStats(data.data.stats || null);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/recruitment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, department, location, openingsCount }),
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setTitle('');
        fetchJobs();
      }
    } catch (err) {
      console.error('Failed to post job:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header Banner */}
      <div
        className="glass-card"
        style={{
          padding: 28,
          marginBottom: 28,
          background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.08) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <UserPlus size={26} color="#3b82f6" />
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Recruitment & Applicant Tracking
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14 }}>
            Post job requisitions, track candidate pipelines, and schedule interviews
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px' }}
        >
          <Plus size={16} /> Post Job Requisition
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 28 }}>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Active Open Positions</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{stats?.activeJobs ?? 0} Jobs</div>
          <span style={{ fontSize: 11, color: '#3b82f6', marginTop: 4, display: 'inline-block' }}>Accepting Candidates</span>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Total Vacancies</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{stats?.totalOpenings ?? 0} Seats</div>
          <span style={{ fontSize: 11, color: '#10b981', marginTop: 4, display: 'inline-block' }}>Target Hires</span>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Total Applicants</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={20} color="#8b5cf6" /> {stats?.totalApplicants ?? 0}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'inline-block' }}>Active Candidate Pipeline</span>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Job Vacancies & Requisitions
          </h3>
          <button onClick={fetchJobs} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
            <RefreshCw size={14} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading job requisitions...</div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No active job vacancies found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-muted)', fontSize: 12 }}>
                  <th style={{ padding: '12px 16px' }}>Job Title</th>
                  <th style={{ padding: '12px 16px' }}>Department</th>
                  <th style={{ padding: '12px 16px' }}>Location</th>
                  <th style={{ padding: '12px 16px' }}>Openings</th>
                  <th style={{ padding: '12px 16px' }}>Applicants</th>
                  <th style={{ padding: '12px 16px' }}>Posted Date</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{job.title}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{job.department}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{job.location}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{job.openingsCount}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#3b82f6' }}>{job.applicantsCount} candidates</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{new Date(job.postedDate).toLocaleDateString('en-GB')}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                        {job.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 480, padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
              Post Job Requisition
            </h2>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Job Title</label>
              <input type="text" className="form-input" placeholder="e.g. Senior Frontend Engineer" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label className="form-label">Department</label>
                <input type="text" className="form-input" value={department} onChange={(e) => setDepartment(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Location</label>
                <input type="text" className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label className="form-label">Open Vacancies Count</label>
              <input type="number" className="form-input" min={1} value={openingsCount} onChange={(e) => setOpeningsCount(Number(e.target.value))} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleCreateJob} disabled={submitting} className="btn btn-primary">{submitting ? 'Posting...' : 'Post Vacancy'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
