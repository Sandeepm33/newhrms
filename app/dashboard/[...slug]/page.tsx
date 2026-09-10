'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MODULES, type ModuleDef, type SubmoduleDef } from '@/config/modules';
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  CalendarOff,
  Banknote,
  UserPlus,
  Target,
  GraduationCap,
  Heart,
  Package,
  FolderKanban,
  BarChart3,
  Settings,
  ShieldCheck,
  ScrollText,
  Megaphone,
  Headphones,
  UserCircle,
  FolderOpen,
  RefreshCcw,
  Clock4,
  AlarmClock,
  ClipboardList,
  Home,
  CalendarDays,
  TrendingUp,
  Scale,
  Receipt,
  PiggyBank,
  RefreshCw,
  CheckSquare,
  Globe,
  Share2,
  Rocket,
  Crosshair,
  MessageSquare,
  Map,
  Award,
  Users2,
  Plane,
  UserCog,
  FileBarChart,
  BrainCircuit,
  Crown,
  GitBranch,
  FileText,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock3,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  CalendarOff,
  Banknote,
  UserPlus,
  Target,
  GraduationCap,
  Heart,
  Package,
  FolderKanban,
  BarChart3,
  Settings,
  ShieldCheck,
  ScrollText,
  Megaphone,
  Headphones,
  UserCircle,
  FolderOpen,
  RefreshCcw,
  Clock4,
  AlarmClock,
  ClipboardList,
  Home,
  CalendarDays,
  TrendingUp,
  Scale,
  Receipt,
  PiggyBank,
  RefreshCw,
  CheckSquare,
  Globe,
  Share2,
  Rocket,
  Crosshair,
  MessageSquare,
  Map,
  Award,
  Users2,
  Plane,
  UserCog,
  FileBarChart,
  BrainCircuit,
  Crown,
  GitBranch,
  FileText,
};

function getIcon(name: string) {
  return ICON_MAP[name] ?? LayoutDashboard;
}

export default function GenericModulePage() {
  const params = useParams();
  const slugArray = Array.isArray(params['slug'])
    ? params['slug']
    : typeof params['slug'] === 'string'
    ? [params['slug']]
    : [];

  const routePath = `/dashboard/${slugArray.join('/')}`;
  const parentSlug = slugArray[0] || '';
  const childSlug = slugArray[1] || '';

  // Find module in registry
  const currentModule = MODULES.find((m) => m.slug === parentSlug);
  const currentSubmodule = currentModule?.submodules?.find(
    (s) => s.slug === childSlug || s.route === routePath
  );

  const moduleTitle = currentSubmodule?.name || currentModule?.name || parentSlug.toUpperCase();
  const moduleGroup = currentModule?.group || 'HR Management';
  const IconComponent = getIcon(currentSubmodule?.icon || currentModule?.icon || 'LayoutDashboard');

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [modalOpen, setModalOpen] = useState(false);

  // Mock domain-specific sample data based on module
  const getSampleItems = () => {
    return [
      { id: '1', name: `${moduleTitle} Record #101`, status: 'Active', category: 'Standard', updated: '2 hours ago', code: 'REC-001' },
      { id: '2', name: `${moduleTitle} Record #102`, status: 'Pending Approval', category: 'Priority', updated: 'Yesterday', code: 'REC-002' },
      { id: '3', name: `${moduleTitle} Record #103`, status: 'Completed', category: 'Internal', updated: '3 days ago', code: 'REC-003' },
      { id: '4', name: `${moduleTitle} Record #104`, status: 'Active', category: 'Standard', updated: '1 week ago', code: 'REC-004' },
      { id: '5', name: `${moduleTitle} Record #105`, status: 'Draft', category: 'Review Required', updated: 'Just now', code: 'REC-005' },
    ];
  };

  const filteredItems = getSampleItems().filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        className="glass-card"
        style={{
          padding: 28,
          marginBottom: 28,
          position: 'relative',
          overflow: 'hidden',
          background:
            'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 50%, rgba(16,185,129,0.05) 100%)',
          border: '1px solid var(--surface-border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(99,102,241,0.25)',
              }}
            >
              <IconComponent size={28} color="white" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--brand-400)',
                    background: 'rgba(99,102,241,0.12)',
                    padding: '2px 8px',
                    borderRadius: 4,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  {moduleGroup}
                </span>
                {currentSubmodule && (
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    / {currentModule?.name}
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {moduleTitle}
              </h1>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Plus size={16} /> New Entry
          </button>
        </div>

        {/* Submodules Bar if parent module has submodules */}
        {currentModule?.submodules && currentModule.submodules.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: 8,
              marginTop: 24,
              paddingTop: 16,
              borderTop: '1px solid var(--surface-border)',
              overflowX: 'auto',
            }}
          >
            {currentModule.submodules.map((sub: SubmoduleDef) => {
              const SubIcon = getIcon(sub.icon);
              const isActiveSub = sub.route === routePath || routePath.endsWith(sub.slug);
              return (
                <Link
                  key={sub.slug}
                  href={sub.route}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: isActiveSub ? 600 : 500,
                    textDecoration: 'none',
                    color: isActiveSub ? 'var(--brand-400)' : 'var(--text-secondary)',
                    background: isActiveSub ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                    border: isActiveSub ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <SubIcon size={15} />
                  {sub.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Total Entries</span>
            <Sparkles size={16} color="var(--brand-400)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>128</div>
          <div style={{ fontSize: 11, color: '#10b981', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            ↑ +12% this month
          </div>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Active Status</span>
            <CheckCircle2 size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>114</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            94% compliance rate
          </div>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Pending Review</span>
            <Clock3 size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>14</div>
          <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 4 }}>
            Action required
          </div>
        </div>
      </div>

      {/* Main Content Area: Search, Filter, Data Table */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setActiveTab('overview')}
              className={activeTab === 'overview' ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ padding: '8px 16px', fontSize: 13 }}
            >
              All Records
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={activeTab === 'pending' ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ padding: '8px 16px', fontSize: 13 }}
            >
              Pending Approval
            </button>
          </div>

          <div style={{ display: 'flex', gap: 12, flex: 1, maxWidth: 400 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder={`Search ${moduleTitle}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 36, fontSize: 13 }}
              />
            </div>
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={14} /> Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px' }}>Code</th>
                <th style={{ padding: '12px 16px' }}>Record Title</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Last Updated</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--brand-400)' }}>
                    {item.code}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item.name}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                    {item.category}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 600,
                        background:
                          item.status === 'Active' || item.status === 'Completed'
                            ? 'rgba(16,185,129,0.15)'
                            : 'rgba(245,158,11,0.15)',
                        color:
                          item.status === 'Active' || item.status === 'Completed'
                            ? '#10b981'
                            : '#f59e0b',
                      }}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                    {item.updated}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>
                      View <ArrowRight size={12} style={{ marginLeft: 4 }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
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
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
              Add New {moduleTitle} Entry
            </h2>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Entry Name / Title</label>
              <input type="text" className="form-input" placeholder={`Enter ${moduleTitle} title...`} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Description / Remarks</label>
              <textarea className="form-input" rows={3} placeholder="Enter details..." />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={() => setModalOpen(false)} className="btn btn-primary">
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
