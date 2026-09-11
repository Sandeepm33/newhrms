'use client';

import { useState, useEffect } from 'react';
import { Settings, Building, Save, Globe, Clock, CheckCircle2, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    industry: 'Technology',
    size: '11-50',
    website: '',
    contactEmail: '',
    contactPhone: '',
    gstin: '',
    pan: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/organization');
      const data = await res.json();
      if (data.success && data.data) {
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
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await fetch('/api/organization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Organization settings updated successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 40 }}>
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
            <Settings size={26} color="#6366f1" />
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Platform & Organization Settings
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14 }}>
            Configure company identity, working hours, tax credentials, and system defaults
          </p>
        </div>
      </div>

      {successMsg && (
        <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#10b981', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading organization settings...</div>
      ) : (
        <form onSubmit={handleSaveSettings}>
          <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Building size={18} color="var(--brand-400)" /> Company Profile
            </h3>

            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Organization Legal Name</label>
              <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label className="form-label">Industry</label>
                <input type="text" className="form-input" value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Company Size</label>
                <select className="form-input" value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })}>
                  <option value="1-10">1 - 10 Employees</option>
                  <option value="11-50">11 - 50 Employees</option>
                  <option value="51-200">51 - 200 Employees</option>
                  <option value="201-500">201 - 500 Employees</option>
                  <option value="1000+">1000+ Employees</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label className="form-label">Contact Email</label>
                <input type="email" className="form-input" value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Contact Phone</label>
                <input type="text" className="form-input" value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label className="form-label">GSTIN</label>
                <input type="text" className="form-input" value={formData.gstin} onChange={(e) => setFormData({ ...formData, gstin: e.target.value })} />
              </div>
              <div>
                <label className="form-label">PAN Number</label>
                <input type="text" className="form-input" value={formData.pan} onChange={(e) => setFormData({ ...formData, pan: e.target.value })} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Website</label>
              <input type="text" className="form-input" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
              {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />} Save Organization Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
