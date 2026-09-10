'use client';

import { useState, useEffect } from 'react';
import {
  Activity,
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Package,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Sparkles,
  Zap,
} from 'lucide-react';

interface ModuleAdoptionItem {
  slug: string;
  name: string;
  group: string;
  activeTenants: number;
  adoptionPercentage: number;
}

interface StatsData {
  totalOrganizations: number;
  activeOrganizations: number;
  trialOrganizations: number;
  suspendedOrganizations: number;
  totalEmployees: number;
  totalMRR: number;
  totalARR: number;
  moduleAdoption: ModuleAdoptionItem[];
}

export default function SuperAdminStatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/super-admin/stats');
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>Loading platform analytics...</div>;
  }

  const groups = Array.from(new Set(stats.moduleAdoption.map((m) => m.group)));
  const filteredModules = stats.moduleAdoption.filter(
    (m) => selectedGroup === 'ALL' || m.group === selectedGroup
  );

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', paddingBottom: 60 }}>
      {/* Banner */}
      <div
        className="glass-card"
        style={{
          padding: 28,
          marginBottom: 28,
          background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(99,102,241,0.1) 50%, rgba(6,182,212,0.05) 100%)',
          border: '1px solid var(--surface-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
            }}
          >
            <Activity size={30} color="white" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#34d399',
                  background: 'rgba(16,185,129,0.15)',
                  padding: '2px 8px',
                  borderRadius: 4,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Platform Analytics & Intelligence
              </span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              SaaS Performance & Module Adoption
            </h1>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div className="glass-card stats-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Monthly Revenue (MRR)</span>
            <DollarSign size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
            ₹{stats.totalMRR.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 11, color: '#10b981', marginTop: 4 }}>
            ARR: ₹{stats.totalARR.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="glass-card stats-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Active Organizations</span>
            <Building2 size={18} color="var(--brand-400)" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
            {stats.activeOrganizations}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Out of {stats.totalOrganizations} total tenants
          </div>
        </div>

        <div className="glass-card stats-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Active Trials</span>
            <Sparkles size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
            {stats.trialOrganizations}
          </div>
          <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 4 }}>Conversion pipeline</div>
        </div>

        <div className="glass-card stats-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Total Employees</span>
            <Users size={18} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
            {stats.totalEmployees}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Active seat licenses</div>
        </div>
      </div>

      {/* Module Sales Leaderboard */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Module Adoption Leaderboard
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
              Real-time usage and adoption rates for all 48 platform modules.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedGroup('ALL')}
              className={`btn ${selectedGroup === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: 11 }}
            >
              All Domains
            </button>
            {groups.map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={`btn ${selectedGroup === grp ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: 11 }}
              >
                {grp}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filteredModules.map((item) => (
            <div
              key={item.slug}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--surface-border)',
                borderRadius: 12,
                padding: 16,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--brand-400)',
                    background: 'rgba(99,102,241,0.15)',
                    padding: '2px 8px',
                    borderRadius: 4,
                  }}
                >
                  {item.group}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                <span>Active Tenants: <strong style={{ color: '#10b981' }}>{item.activeTenants}</strong></span>
                <span>Adoption: <strong>{item.adoptionPercentage}%</strong></span>
              </div>

              {/* Progress bar */}
              <div style={{ height: 6, width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${item.adoptionPercentage}%`,
                    background: 'linear-gradient(90deg, #6366f1, #10b981)',
                    borderRadius: 10,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
