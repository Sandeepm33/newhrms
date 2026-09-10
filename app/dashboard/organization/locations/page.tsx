'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Plus,
  Search,
  Loader2,
  Building2,
  Globe,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';

interface Location {
  _id: string;
  name: string;
  code: string;
  type?: string;
  city?: string;
  state?: string;
  country?: string;
  timezone?: string;
  isActive: boolean;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', city: '', country: 'India', type: 'HEADQUARTERS' });

  async function fetchLocations() {
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/locations${query}`);
      const data = (await res.json()) as { data?: Location[] };
      if (data.data) {
        setLocations(data.data);
      }
    } catch {
      // Error fetching
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchLocations();
  }, [search]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({ name: '', code: '', city: '', country: 'India', type: 'HEADQUARTERS' });
        setModalOpen(false);
        await fetchLocations();
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
            <MapPin size={26} color="#10b981" /> Work Locations
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: 14 }}>
            Manage headquarters, regional branch offices, and work sites
          </p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Add Location
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-card" style={{ padding: 16, marginBottom: 24, display: 'flex', gap: 16 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search locations by name or city..."
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
      ) : locations.length === 0 ? (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
          <Building2 size={40} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 16, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>No Locations Configured</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
            Add your headquarters or local office address.
          </p>
          <button onClick={() => setModalOpen(true)} className="btn btn-primary">
            + Add Location
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {locations.map((loc) => (
            <div key={loc._id} className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: 'rgba(16,185,129,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <MapPin size={20} color="#10b981" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{loc.name}</h3>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 4 }}>
                        {loc.code}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Globe size={14} color="var(--text-muted)" /> {loc.city || 'Primary City'}, {loc.country || 'India'}
                </div>
              </div>

              <div style={{ paddingTop: 16, borderTop: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                  <CheckCircle size={14} /> Active Office
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
              Add Location
            </h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Location Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Mumbai HQ, Bangalore Tech Park"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="form-label">Location Code</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. MUM-HQ"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Mumbai"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {submitting && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
