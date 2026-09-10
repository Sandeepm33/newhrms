'use client';

import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { Bell, Search, ChevronDown, LogOut, User, Settings, Sun, Moon } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { useTheme } from '@/components/theme/ThemeProvider';

export default function TopNav() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const [search, setSearch] = useState('');

  const user = session?.user;

  return (
    <header style={{
      height: 64,
      background: 'var(--topnav-bg)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--surface-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 420, flex: 1 }}>
        <Search
          size={15}
          style={{
            position: 'absolute', left: 12, top: '50%',
            transform: 'translateY(-50%)', color: 'var(--text-muted)',
          }}
        />
        <input
          type="text"
          placeholder="Search employees, documents, modules..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input"
          style={{
            paddingLeft: 36,
            fontSize: 13,
          }}
        />
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Theme Toggle Button (Light / Dark) */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          style={{
            background: 'var(--surface-elevated)',
            border: '1px solid var(--surface-border)',
            borderRadius: 10,
            width: 38, height: 38,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-secondary)',
            transition: 'all 0.2s ease',
          }}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} color="#f59e0b" />}
        </button>

        {/* Notifications */}
        <button
          style={{
            background: 'var(--surface-elevated)',
            border: '1px solid var(--surface-border)',
            borderRadius: 10,
            width: 38, height: 38,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-secondary)',
            position: 'relative',
          }}
        >
          <Bell size={16} />
          {/* Notification dot */}
          <div style={{
            position: 'absolute', top: 8, right: 8,
            width: 8, height: 8, borderRadius: '50%',
            background: '#6366f1',
            border: '2px solid var(--surface-card)',
          }} />
        </button>

        {/* User menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--surface-elevated)',
              border: '1px solid var(--surface-border)',
              borderRadius: 12, padding: '6px 12px 6px 6px',
              cursor: 'pointer',
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              {user?.name ? getInitials(user.name) : 'U'}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {user?.name ?? 'User'}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.2 }}>
                {user?.organizationName ?? (user?.isSuperAdmin ? 'Super Admin' : '')}
              </div>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {showMenu && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 49 }}
                onClick={() => setShowMenu(false)}
              />
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                background: 'var(--surface-card)',
                border: '1px solid var(--surface-border)',
                borderRadius: 14, padding: 8, minWidth: 200,
                zIndex: 50,
                boxShadow: '0 16px 40px rgba(0,0,0,0.15)',
              }}>
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--surface-border)', marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user?.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.email}</div>
                  {user?.roles && user.roles.length > 0 && (
                    <div style={{
                      marginTop: 6, display: 'inline-block',
                      background: 'rgba(99,102,241,0.15)',
                      border: '1px solid rgba(99,102,241,0.3)',
                      borderRadius: 6, padding: '2px 8px',
                      fontSize: 10, color: 'var(--brand-500)', fontWeight: 600, textTransform: 'uppercase',
                    }}>
                      {user.roles[0]?.replace('_', ' ')}
                    </div>
                  )}
                </div>

                {[
                  { icon: User, label: 'My Profile', href: '/dashboard/ess/profile' },
                  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
                ].map(({ icon: Icon, label, href }) => (
                  <a
                    key={href}
                    href={href}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: 10, cursor: 'pointer',
                      color: 'var(--text-secondary)', fontSize: 13,
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    <Icon size={15} />
                    {label}
                  </a>
                ))}

                <div style={{ borderTop: '1px solid var(--surface-border)', marginTop: 8, paddingTop: 8 }}>
                  <button
                    onClick={() => void signOut({ callbackUrl: '/login' })}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: 10, cursor: 'pointer',
                      color: '#ef4444', fontSize: 13, background: 'none', border: 'none',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
