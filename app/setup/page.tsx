'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, CheckCircle, Loader2, Building2 } from 'lucide-react';

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    country: 'India',
  });

  useEffect(() => {
    async function checkSetup() {
      const res = await fetch('/api/setup');
      const data = await res.json() as { data?: { isSetupComplete?: boolean } };
      if (data.data?.isSetupComplete) {
        router.push('/login');
      } else {
        setChecking(false);
      }
    }
    void checkSetup();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    const res = await fetch('/api/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        organizationName: form.organizationName,
        country: form.country,
      }),
    });

    const data = await res.json() as { success?: boolean; message?: string };
    setLoading(false);

    if (data.success) {
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2500);
    } else {
      setError(data.message ?? 'Setup failed. Please try again.');
    }
  }

  if (checking) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--surface-bg)',
      }}>
        <Loader2 size={32} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: 'var(--surface-bg)', gap: 16,
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CheckCircle size={40} color="#22c55e" />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Setup Complete!</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 60%), var(--surface-bg)',
      padding: '40px 20px',
    }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            padding: '10px 20px', borderRadius: 14, marginBottom: 16,
          }}>
            <Zap size={22} color="white" />
            <span style={{ color: 'white', fontSize: 18, fontWeight: 800 }}>HRNexus</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            Initial Setup
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Create your Super Admin account and organization
          </p>
        </div>

        <div className="glass-card" style={{ padding: 36 }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10, padding: '12px 16px', marginBottom: 20,
              color: '#ef4444', fontSize: 13,
            }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Section: Organization */}
            <div style={{
              background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 12, padding: '16px', marginBottom: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Building2 size={16} color="#6366f1" />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-400)' }}>
                  Organization Details
                </span>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Organization Name *</label>
                <input
                  id="org-name"
                  className="form-input"
                  placeholder="Acme Corp Pvt. Ltd."
                  value={form.organizationName}
                  onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">Country</label>
                <select
                  className="form-input"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                >
                  <option value="India">India</option>
                  <option value="USA">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="UAE">UAE</option>
                  <option value="Singapore">Singapore</option>
                </select>
              </div>
            </div>

            {/* Section: Admin */}
            <div style={{ marginBottom: 20 }}>
              <p style={{
                fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16,
              }}>
                Super Admin Account
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="form-label">Full Name *</label>
                  <input
                    id="admin-name"
                    className="form-input"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Email *</label>
                  <input
                    id="admin-email"
                    type="email"
                    className="form-input"
                    placeholder="admin@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="form-label">Password *</label>
                  <input
                    id="admin-password"
                    type="password"
                    className="form-input"
                    placeholder="Min 8 chars"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <label className="form-label">Confirm Password *</label>
                  <input
                    id="confirm-password"
                    type="password"
                    className="form-input"
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              id="setup-btn"
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '13px 20px', fontSize: 14 }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Setting up HRNexus...
                </>
              ) : (
                '🚀 Complete Setup'
              )}
            </button>
          </form>
        </div>
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
