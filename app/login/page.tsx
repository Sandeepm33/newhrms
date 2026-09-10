'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Building2, Zap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid email or password. Please try again.');
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.1) 0%, transparent 60%), var(--surface-bg)',
        padding: '20px',
      }}
    >
      {/* Background orbs */}
      <div style={{
        position: 'fixed', top: '10%', left: '10%', width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '10%', right: '10%', width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            padding: '10px 20px', borderRadius: 16,
            marginBottom: 20,
          }}>
            <Zap size={24} color="white" />
            <span style={{ color: 'white', fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>
              HRNexus
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Sign in to your HRMS workspace
          </p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: 36 }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 20,
              color: '#ef4444',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Email Address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '13px 20px', fontSize: 14 }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div style={{
            marginTop: 24,
            paddingTop: 24,
            borderTop: '1px solid var(--surface-border)',
            textAlign: 'center',
          }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              First time?{' '}
              <a
                href="/setup"
                style={{ color: 'var(--brand-400)', textDecoration: 'none', fontWeight: 600 }}
              >
                Set up your organization →
              </a>
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: 11 }}>
          Enterprise HRMS • Secure • Multi-tenant
        </p>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
