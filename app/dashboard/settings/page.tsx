'use client';

import { useState } from 'react';
import {
  Settings,
  Building2,
  Users,
  Shield,
  Bell,
  Globe,
  Sliders,
  CheckCircle2,
  Save,
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  function handleSave() {
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  }

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
            <Settings size={26} color="#6366f1" />
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              System & Workspace Settings
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14 }}>
            Configure organization preferences, notification rules, security policies, and integrations
          </p>
        </div>

        <button onClick={handleSave} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--surface-border)', paddingBottom: 12 }}>
        <button
          onClick={() => setActiveTab('general')}
          className={activeTab === 'general' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{ padding: '8px 18px', fontSize: 13 }}
        >
          General Settings
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={activeTab === 'security' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{ padding: '8px 18px', fontSize: 13 }}
        >
          Security & Password Policy
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={activeTab === 'notifications' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{ padding: '8px 18px', fontSize: 13 }}
        >
          Notifications & Email
        </button>
      </div>

      {/* Main Settings Card */}
      <div className="glass-card" style={{ padding: 32 }}>
        {activeTab === 'general' && (
          <div style={{ maxWidth: 640 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
              Workspace Preferences
            </h3>

            <div style={{ marginBottom: 20 }}>
              <label className="form-label">System Default Timezone</label>
              <select className="form-input" defaultValue="Asia/Kolkata">
                <option value="Asia/Kolkata">(UTC+05:30) Asia/Kolkata (IST)</option>
                <option value="UTC">(UTC+00:00) Coordinated Universal Time</option>
                <option value="America/New_York">(UTC-05:00) Eastern Time (US & Canada)</option>
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Currency Symbol</label>
              <select className="form-input" defaultValue="INR">
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Date Format</label>
              <select className="form-input" defaultValue="DD/MM/YYYY">
                <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (2026-12-31)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2026)</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div style={{ maxWidth: 640 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
              Authentication & Security Controls
            </h3>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ width: 18, height: 18, accentColor: 'var(--brand-500)' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Enforce Two-Factor Authentication (2FA) for Admin Roles
                </span>
              </label>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Session Idle Timeout (Minutes)</label>
              <input type="number" className="form-input" defaultValue={30} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Minimum Password Length</label>
              <input type="number" className="form-input" defaultValue={10} />
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div style={{ maxWidth: 640 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
              Email & System Alerts
            </h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ width: 18, height: 18, accentColor: 'var(--brand-500)' }} />
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                  Send automated email alerts for pending leave approvals
                </span>
              </label>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ width: 18, height: 18, accentColor: 'var(--brand-500)' }} />
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                  Send monthly automated payslip notifications to employees
                </span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
