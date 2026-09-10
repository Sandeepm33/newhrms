'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Network,
  Plus,
  Search,
  Loader2,
  Building2,
  Users,
  Edit2,
  Trash2,
  ArrowLeft,
} from 'lucide-react';

interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  headOfDepartmentId?: string;
  isActive: boolean;
  createdAt?: string;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });

  async function fetchDepartments() {
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/departments${query}`);
      const data = (await res.json()) as { data?: Department[] };
      if (data.data) {
        setDepartments(data.data);
      }
    } catch {
      // Error fetching
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchDepartments();
  }, [search]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({ name: '', code: '', description: '' });
        setModalOpen(false);
        await fetchDepartments();
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
            <Network size={26} color="#6366f1" /> Departments
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: 14 }}>
            Organize company structure into operational units and departments
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Plus size={16} /> Add Department
        </button>
      </div>

      {/* Search & Actions Bar */}
      <div className="glass-card" style={{ padding: 16, marginBottom: 24, display: 'flex', gap: 16 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search departments by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 38 }}
          />
        </div>
      </div>

      {/* List / Cards */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--brand-400)' }} />
        </div>
      ) : departments.length === 0 ? (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
          <Building2 size={40} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 16, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>No Departments Found</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
            Get started by creating your organization&apos;s first department.
          </p>
          <button onClick={() => setModalOpen(true)} className="btn btn-primary">
            + Create Department
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {departments.map((dept) => (
            <div key={dept._id} className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: 'rgba(99,102,241,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Network size={20} color="#6366f1" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{dept.name}</h3>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: 'var(--brand-400)',
                          background: 'rgba(99,102,241,0.1)',
                          padding: '2px 8px',
                          borderRadius: 4,
                          letterSpacing: 0.5,
                        }}
                      >
                        {dept.code}
                      </span>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                  {dept.description || 'No description provided.'}
                </p>
              </div>

              <div style={{ paddingTop: 16, borderTop: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={14} /> Active Unit
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: 12 }}>
                    <Edit2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Department Modal */}
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
              Create New Department
            </h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Department Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Engineering, Human Resources"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Department Code</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. ENG, HR, FIN"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Brief summary of department responsibilities..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {submitting && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
