'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Key,
  Users,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function RolesPage() {
  const roles = [
    { name: 'Super Admin', slug: 'super_admin', scope: 'PLATFORM', users: 1, isSystem: true },
    { name: 'Global Admin', slug: 'global_admin', scope: 'ORGANIZATION', users: 3, isSystem: true },
    { name: 'HR Admin', slug: 'hr_admin', scope: 'ORGANIZATION', users: 8, isSystem: true },
    { name: 'HR Executive', slug: 'hr_executive', scope: 'DEPARTMENT', users: 15, isSystem: true },
    { name: 'Payroll Admin', slug: 'payroll_admin', scope: 'ORGANIZATION', users: 4, isSystem: true },
    { name: 'Manager', slug: 'manager', scope: 'TEAM', users: 45, isSystem: true },
    { name: 'Employee', slug: 'employee', scope: 'SELF', users: 436, isSystem: true },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
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
            <ShieldCheck size={26} color="#6366f1" />
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Roles & Granular RBAC Permissions
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14 }}>
            Configure role access control, scope boundaries, and action-level permission matrices
          </p>
        </div>

        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Create Custom Role
        </button>
      </div>

      {/* Roles Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {roles.map((role) => (
          <div key={role.slug} className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: 'rgba(99,102,241,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ShieldCheck size={18} color="#6366f1" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{role.name}</h3>
                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--brand-400)' }}>{role.slug}</span>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={13} /> Data Scope: <strong style={{ color: 'var(--text-primary)' }}>{role.scope}</strong>
              </div>
            </div>

            <div style={{ paddingTop: 16, borderTop: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Users size={14} /> {role.users} Active Users
              </span>
              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>
                Permissions →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
