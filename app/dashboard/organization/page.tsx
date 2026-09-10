'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Network,
  MapPin,
  Badge,
  Briefcase,
  Scale,
  Users,
  Globe,
  Mail,
  Phone,
  Calendar,
  Edit3,
  CheckCircle2,
  Loader2,
  Shield,
  Layers,
} from 'lucide-react';

interface OrgDetails {
  _id: string;
  name: string;
  slug: string;
  country: string;
  website?: string;
  industry?: string;
  size?: string;
  contactEmail?: string;
  contactPhone?: string;
  gstin?: string;
  pan?: string;
  subscriptionStatus?: string;
  settings?: {
    currency?: string;
    timezone?: string;
    workingHoursStart?: string;
    workingHoursEnd?: string;
  };
  stats?: {
    departments: number;
    locations: number;
    designations: number;
    employees: number;
  };
}

export default function OrganizationOverviewPage() {
  const [org, setOrg] = useState<OrgDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    size: '11-50',
    website: '',
    contactEmail: '',
    contactPhone: '',
    gstin: '',
    pan: '',
  });

  async function fetchOrg() {
    try {
      const res = await fetch('/api/organization');
      const data = (await res.json()) as { data?: OrgDetails };
      if (data.data) {
        setOrg(data.data);
        setFormData({
          name: data.data.name || '',
          industry: data.data.industry || 'Technology',
          size: data.data.size || '11-50',
          website: data.data.website || '',
          contactEmail: data.data.contactEmail || '',
          contactPhone: data.data.contactPhone || '',
          gstin: data.data.gstin || '',
          pan: data.data.pan || '',
        });
      }
    } catch {
      // Error fetching org
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchOrg();
  }, []);

  async function handleUpdateOrg(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/organization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        await fetchOrg();
        setEditModalOpen(false);
      }
    } catch {
      // Error updating
    } finally {
      setSaving(false);
    }
  }

  const submodules = [
    {
      title: 'Departments',
      count: org?.stats?.departments ?? 0,
      icon: Network,
      href: '/dashboard/organization/departments',
      color: '#6366f1',
      desc: 'Structure teams, divisions, and department heads',
    },
    {
      title: 'Locations',
      count: org?.stats?.locations ?? 0,
      icon: MapPin,
      href: '/dashboard/organization/locations',
      color: '#10b981',
      desc: 'Manage offices, branches, and geographical units',
    },
    {
      title: 'Designations',
      count: org?.stats?.designations ?? 0,
      icon: Badge,
      href: '/dashboard/organization/designations',
      color: '#f59e0b',
      desc: 'Define job titles, grades, and pay scales',
    },
    {
      title: 'Business Units',
      count: 1,
      icon: Briefcase,
      href: '/dashboard/organization/departments',
      color: '#ec4899',
      desc: 'Segment enterprise operating entities',
    },
    {
      title: 'Legal Entities',
      count: 1,
      icon: Scale,
      href: '/dashboard/organization/departments',
      color: '#8b5cf6',
      desc: 'Manage legal registration and tax entities',
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: 40, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--brand-400)' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        className="glass-card"
        style={{
          padding: 32,
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden',
          background:
            'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 50%, rgba(16,185,129,0.05) 100%)',
          border: '1px solid var(--surface-border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
              }}
            >
              <Building2 size={32} color="white" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {org?.name || 'Acme Corporation'}
                </h1>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 10px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    background: 'rgba(16,185,129,0.15)',
                    color: '#10b981',
                    border: '1px solid rgba(16,185,129,0.3)',
                  }}
                >
                  <CheckCircle2 size={12} /> Active Plan
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14 }}>
                Enterprise Workspace • {org?.industry || 'Technology'} • {org?.country || 'India'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setEditModalOpen(true)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Edit3 size={15} /> Edit Profile
          </button>
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
            marginTop: 28,
            paddingTop: 24,
            borderTop: '1px solid var(--surface-border)',
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total Workforce</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} color="var(--brand-400)" />
              {org?.stats?.employees ?? 0}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Departments</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Network size={18} color="#6366f1" />
              {org?.stats?.departments ?? 0}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Active Locations</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={18} color="#10b981" />
              {org?.stats?.locations ?? 0}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Designations</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Badge size={18} color="#f59e0b" />
              {org?.stats?.designations ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* Submodule Navigation Cards */}
      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
        Organizational Structure & Modules
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginBottom: 36 }}>
        {submodules.map((sub) => {
          const IconComponent = sub.icon;
          return (
            <Link
              key={sub.title}
              href={sub.href}
              className="glass-card"
              style={{
                padding: 24,
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `${sub.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconComponent size={22} color={sub.color} />
                  </div>
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      background: 'var(--surface-elevated)',
                      padding: '4px 12px',
                      borderRadius: 20,
                      border: '1px solid var(--surface-border)',
                    }}
                  >
                    {sub.count}
                  </span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                  {sub.title}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  {sub.desc}
                </p>
              </div>
              <div style={{ marginTop: 20, fontSize: 13, fontWeight: 600, color: 'var(--brand-400)', display: 'flex', alignItems: 'center', gap: 4 }}>
                Manage {sub.title} →
              </div>
            </Link>
          );
        })}
      </div>

      {/* Organization Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Company Information */}
        <div className="glass-card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Building2 size={18} color="var(--brand-400)" /> Company Information
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Globe size={16} color="var(--text-muted)" />
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Website</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {org?.website || 'https://acme.com'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Mail size={16} color="var(--text-muted)" />
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Contact Email</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {org?.contactEmail || 'contact@acme.com'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Phone size={16} color="var(--text-muted)" />
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Phone Number</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {org?.contactPhone || '+91 98765 43210'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Shield size={16} color="var(--text-muted)" />
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tax Identifiers (GSTIN / PAN)</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {org?.gstin || '27AAAAA0000A1Z5'} • {org?.pan || 'AAAAA0000A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Operating Configuration */}
        <div className="glass-card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Layers size={18} color="var(--brand-400)" /> Work Preferences
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Calendar size={16} color="var(--text-muted)" />
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Working Days & Hours</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                  Mon - Fri • 09:00 AM - 06:00 PM
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Globe size={16} color="var(--text-muted)" />
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Timezone & Currency</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                  Asia/Kolkata (IST) • INR (₹)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Organization Modal */}
      {editModalOpen && (
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
          <div className="glass-card" style={{ width: '100%', maxWidth: 540, padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
              Edit Organization Profile
            </h2>
            <form onSubmit={handleUpdateOrg}>
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Organization Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="form-label">Industry</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Website</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div>
                  <label className="form-label">Contact Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  {saving && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
