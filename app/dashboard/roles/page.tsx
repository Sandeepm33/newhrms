'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Users, Key, RefreshCw } from 'lucide-react';

interface RoleItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  isSystem: boolean;
  assignedUsersCount: number;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/roles');
      const data = await res.json();
      if (data.success) {
        setRoles(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, color }),
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setName('');
        setDescription('');
        fetchRoles();
      }
    } catch (err) {
      console.error('Failed to create role:', err);
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
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(236,72,153,0.08) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <ShieldCheck size={26} color="#6366f1" />
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Roles & Access Permissions
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14 }}>
            Define RBAC security roles, permission matrices, and user assignment scopes
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px' }}
        >
          <Plus size={16} /> Create Custom Role
        </button>
      </div>

      {/* Roles Grid Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          System & Custom Roles
        </h2>
        <button onClick={fetchRoles} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading security roles...</div>
      ) : roles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No security roles defined.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {roles.map((role) => {
            const roleColor = role.color || '#6366f1';
            return (
              <div key={role._id} className="glass-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: roleColor }} />
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {role.name}
                    </h3>
                  </div>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 700,
                      background: role.isSystem ? 'rgba(99,102,241,0.15)' : 'rgba(16,185,129,0.15)',
                      color: role.isSystem ? '#6366f1' : '#10b981',
                      textTransform: 'uppercase',
                    }}
                  >
                    {role.isSystem ? 'System' : 'Custom'}
                  </span>
                </div>

                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16, minHeight: 36, lineHeight: 1.4 }}>
                  {role.description || `Role slug: ${role.slug}`}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Users size={14} color="var(--brand-400)" />
                    <span>{role.assignedUsersCount} users assigned</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--brand-400)', fontWeight: 600, cursor: 'pointer' }}>
                    <Key size={12} /> Matrix
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 480, padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
              Create Custom Role
            </h2>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Role Name</label>
              <input type="text" className="form-input" placeholder="e.g. Audit Inspector" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={3} placeholder="Describe scope and responsibilities..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label className="form-label">Theme Tag Color</label>
              <input type="color" className="form-input" style={{ height: 40, padding: 4 }} value={color} onChange={(e) => setColor(e.target.value)} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleCreateRole} disabled={submitting} className="btn btn-primary">{submitting ? 'Creating...' : 'Create Role'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
