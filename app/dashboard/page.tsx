'use client';

import { useEffect, useState } from 'react';
import {
  Users, UserCheck, UserPlus, UserMinus, Building2,
  TrendingUp, Activity, BarChart3, ArrowUp, ArrowDown,
} from 'lucide-react';

interface Stat {
  label: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: string;
}

interface DashboardData {
  role: string;
  stats: Stat[];
  departmentBreakdown?: Array<{ name?: string; count: number }>;
  statusBreakdown?: Array<{ _id: string; count: number }>;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Users, UserCheck, UserPlus, UserMinus, Building2, TrendingUp, Activity, BarChart3,
};
const COLOR_MAP: Record<string, string> = {
  blue: '#3b82f6', green: '#22c55e', purple: '#8b5cf6',
  orange: '#f59e0b', red: '#ef4444', indigo: '#6366f1',
};

function StatCard({ stat }: { stat: Stat }) {
  const Icon = ICON_MAP[stat.icon] ?? Activity;
  const color = COLOR_MAP[stat.color] ?? '#6366f1';

  return (
    <div
      className="glass-card stats-card"
      style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${color}20`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color={color} />
        </div>
        {stat.change !== undefined && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600,
            color: stat.changeType === 'increase' ? '#22c55e' : '#ef4444',
          }}>
            {stat.changeType === 'increase'
              ? <ArrowUp size={14} />
              : <ArrowDown size={14} />}
            {Math.abs(stat.change)}%
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
          {typeof stat.value === 'number' ? stat.value.toLocaleString('en-IN') : stat.value}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
          {stat.label}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div className="skeleton" style={{ height: 44, width: 44, borderRadius: 12, marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 36, width: '60%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 16, width: '80%' }} />
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/dashboard/stats');
        const json = await res.json() as { success?: boolean; data?: DashboardData; message?: string };
        if (json.success) {
          setData(json.data ?? null);
        } else {
          setError(json.message ?? 'Failed to load');
        }
      } catch {
        setError('Unable to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    void loadStats();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Welcome back — here's what's happening in your organization
        </p>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {[1,2,3,4].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 12, padding: 20, color: '#ef4444',
        }}>
          {error}
        </div>
      ) : data && data.stats.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {data.stats.map((stat, i) => (
            <StatCard key={i} stat={stat} />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'var(--surface-card)', borderRadius: 16,
          border: '1px solid var(--surface-border)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
            No data yet
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 320, margin: '0 auto' }}>
            Start adding employees and data will appear here automatically
          </p>
          <a
            href="/dashboard/employees/new"
            className="btn btn-primary"
            style={{ display: 'inline-flex', marginTop: 20 }}
          >
            <UserPlus size={16} /> Add First Employee
          </a>
        </div>
      )}

      {/* Department breakdown */}
      {data?.departmentBreakdown && data.departmentBreakdown.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
            Employees by Department
          </h2>
          <div className="glass-card" style={{ padding: 24 }}>
            {data.departmentBreakdown.map((dept, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: i < data.departmentBreakdown!.length - 1
                    ? '1px solid var(--surface-border)' : 'none',
                }}
              >
                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                  {dept.name ?? 'Unassigned'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    height: 6, width: 120, background: 'var(--surface-elevated)', borderRadius: 99,
                  }}>
                    <div style={{
                      height: 6,
                      width: `${Math.round((dept.count / (data.stats[0]?.value as number || 1)) * 100)}%`,
                      background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                      borderRadius: 99,
                    }} />
                  </div>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 13, minWidth: 28, textAlign: 'right' }}>
                    {dept.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
          Quick Actions
        </h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Add Employee', href: '/dashboard/employees/new', icon: '👤' },
            { label: 'View Employees', href: '/dashboard/employees', icon: '👥' },
            { label: 'Organization', href: '/dashboard/organization', icon: '🏢' },
            { label: 'Roles & Permissions', href: '/dashboard/roles', icon: '🔑' },
          ].map((action) => (
            <a
              key={action.href}
              href={action.href}
              className="btn btn-secondary"
              style={{ textDecoration: 'none' }}
            >
              <span>{action.icon}</span>
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
