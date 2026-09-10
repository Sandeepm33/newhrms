'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Badge,
  Plus,
  Search,
  Loader2,
  Building2,
  ArrowLeft,
  Award,
} from 'lucide-react';

interface Designation {
  _id: string;
  name: string;
  code: string;
  level?: number;
  grade?: string;
  description?: string;
  isActive: boolean;
}

export default function DesignationsPage() {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', grade: 'L3', level: 3 });

  async function fetchDesignations() {
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/designations${query}`);
      const data = (await res.json()) as { data?: Designation[] };
      if (data.data) {
        setDesignations(data.data);
      }
    } catch {
      // Error fetching
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchDesignations();
  }, [search]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/designations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({ name: '', code: '', grade: 'L3', level: 3 });
        setModalOpen(false);
        await fetchDesignations();
      }
    } catch {
      // Error creating
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Navigation Breadcrumb */}
      <div style={{ marginBottom: 20 }}>
        <Link
          href="/dashboard/organization"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={14} /> Back to Organization Overview
        </Link>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Badge size={26} color="#f59e0b" /> Designations & Job Titles
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: 14 }}>
            Define job roles, hierarchy levels, and career progression grades
          </p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Add Designation
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-card" style={{ padding: 16, marginBottom: 24, display: 'flex', gap: 16 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search designations by title or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 38 }}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--brand-400)' }} />
        </div>
      ) : designations.length === 0 ? (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
          <Building2 size={40} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 16, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>No Designations Created</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
            Set up job roles like Senior Software Engineer, HR Manager, VP of Product.
          </p>
          <button onClick={() => setModalOpen(true)} className="btn btn-primary">
            + Add Designation
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {designations.map((desig) => (
            <div key={desig._id} className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: 'rgba(245,158,11,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Badge size={20} color="#f59e0b" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{desig.name}</h3>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: 4 }}>
                        {desig.code}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ paddingTop: 16, borderTop: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Award size={14} color="#f59e0b" /> Grade: <strong>{desig.grade || 'L3'}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
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
              Add Designation
            </h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Job Title / Designation</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Senior Software Engineer"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="form-label">Code</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. SSE"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Grade</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. L4, M1, E2"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {submitting && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                  Save Designation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
