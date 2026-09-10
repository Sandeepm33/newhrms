'use client';

import { useState, useEffect } from 'react';
import { MODULES, type ModuleDef } from '@/config/modules';
import {
  Building2,
  Search,
  Users,
  Layers,
  Check,
  Sparkles,
  DollarSign,
  Package,
  X,
  Plus,
  UserCheck,
  Lock,
  Mail,
  User,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

interface OrganizationItem {
  _id: string;
  name: string;
  slug: string;
  country: string;
  planId?: string;
  planName?: string;
  subscriptionStatus: 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';
  monthlyPrice: number;
  employeeCount: number;
  enabledModulesCount: number;
  settings?: {
    enabledModules: string[];
    maxEmployees: number;
  };
  isActive: boolean;
  isSuspended: boolean;
  createdAt: string;
}

export default function SuperAdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State for Selling / Assigning Modules (Full Screen)
  const [selectedOrg, setSelectedOrg] = useState<OrganizationItem | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('starter');
  const [maxEmployees, setMaxEmployees] = useState<number>(100);
  const [saving, setSaving] = useState(false);
  const [activeGroupFilter, setActiveGroupFilter] = useState<string>('ALL');

  // Modal State for Creating Organization & Company Admin (Full Screen)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLicensingMode, setCreateLicensingMode] = useState<'PLAN' | 'CUSTOM'>('PLAN');
  const [createDomainFilter, setCreateDomainFilter] = useState<string>('ALL');
  const [createData, setCreateData] = useState({
    organizationName: '',
    slug: '',
    country: 'India',
    planId: 'growth',
    enabledModules: [] as string[],
    maxEmployees: 100,
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [orgRes, planRes] = await Promise.all([
        fetch('/api/super-admin/organizations'),
        fetch('/api/super-admin/plans'),
      ]);
      const orgData = await orgRes.json();
      const planData = await planRes.json();

      if (orgData.success) setOrganizations(orgData.data);
      if (planData.success) {
        setPlans(planData.data);
        const growthPlan = planData.data.find((p: any) => p.slug === 'growth') || planData.data[0];
        if (growthPlan) {
          setCreateData((prev) => ({
            ...prev,
            planId: growthPlan.slug,
            enabledModules: growthPlan.includedModules || [],
            maxEmployees: growthPlan.maxEmployees || 100,
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load superadmin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    const defaultPlan = plans.find((p) => p.slug === 'growth') || plans[0];
    setCreateData({
      organizationName: '',
      slug: '',
      country: 'India',
      planId: defaultPlan?.slug || 'growth',
      enabledModules: defaultPlan?.includedModules || MODULES.slice(0, 15).map((m) => m.slug),
      maxEmployees: defaultPlan?.maxEmployees || 100,
      adminName: '',
      adminEmail: '',
      adminPassword: '',
    });
    setCreateLicensingMode('PLAN');
    setCreateDomainFilter('ALL');
    setCreateError(null);
    setCreateSuccess(null);
    setCreateModalOpen(true);
  };

  const handlePlanChangeInCreate = (planSlug: string) => {
    const plan = plans.find((p) => p.slug === planSlug);
    setCreateData((prev) => ({
      ...prev,
      planId: planSlug,
      enabledModules: plan?.includedModules || prev.enabledModules,
      maxEmployees: plan?.maxEmployees || prev.maxEmployees,
    }));
  };

  const handleToggleModuleInCreate = (slug: string) => {
    setCreateData((prev) => ({
      ...prev,
      enabledModules: prev.enabledModules.includes(slug)
        ? prev.enabledModules.filter((s) => s !== slug)
        : [...prev.enabledModules, slug],
    }));
  };

  const handleSelectAllInDomainInCreate = (groupName: string) => {
    const groupSlugs = MODULES.filter((m) => m.group === groupName).map((m) => m.slug);
    const allSelected = groupSlugs.every((s) => createData.enabledModules.includes(s));

    setCreateData((prev) => ({
      ...prev,
      enabledModules: allSelected
        ? prev.enabledModules.filter((s) => !groupSlugs.includes(s))
        : Array.from(new Set([...prev.enabledModules, ...groupSlugs])),
    }));
  };

  const openModuleDrawer = (org: OrganizationItem) => {
    setSelectedOrg(org);
    setSelectedModules(org.settings?.enabledModules || ['employees', 'attendance', 'leave']);
    setSelectedPlanId(org.planId || 'starter');
    setMaxEmployees(org.settings?.maxEmployees || 100);
    setActiveGroupFilter('ALL');
  };

  const handleToggleModule = (moduleSlug: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleSlug) ? prev.filter((s) => s !== moduleSlug) : [...prev, moduleSlug]
    );
  };

  const handleSelectAllInGroup = (groupName: string) => {
    const groupModuleSlugs = MODULES.filter((m) => m.group === groupName).map((m) => m.slug);
    const allSelected = groupModuleSlugs.every((s) => selectedModules.includes(s));

    if (allSelected) {
      setSelectedModules((prev) => prev.filter((s) => !groupModuleSlugs.includes(s)));
    } else {
      setSelectedModules((prev) => Array.from(new Set([...prev, ...groupModuleSlugs])));
    }
  };

  const handleSelectAllModules = () => {
    setSelectedModules(MODULES.map((m) => m.slug));
  };

  const handleApplyPlanModules = (planSlug: string) => {
    const plan = plans.find((p) => p.slug === planSlug);
    if (plan && Array.isArray(plan.includedModules)) {
      setSelectedPlanId(planSlug);
      setSelectedModules(plan.includedModules);
      setMaxEmployees(plan.maxEmployees || maxEmployees);
    }
  };

  const handleSaveModules = async () => {
    if (!selectedOrg) return;
    setSaving(true);
    try {
      const res = await fetch('/api/super-admin/organizations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: selectedOrg._id,
          planId: selectedPlanId,
          enabledModules: selectedModules,
          maxEmployees,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrganizations((prev) =>
          prev.map((o) => (o._id === selectedOrg._id ? { ...o, ...data.data, enabledModulesCount: selectedModules.length } : o))
        );
        setSelectedOrg(null);
      }
    } catch (err) {
      console.error('Failed to update organization modules:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateOrganizationAndAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const res = await fetch('/api/super-admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationName: createData.organizationName,
          slug: createData.slug,
          country: createData.country,
          planId: createLicensingMode === 'CUSTOM' ? 'custom' : createData.planId,
          enabledModules: createData.enabledModules,
          maxEmployees: createData.maxEmployees,
          adminName: createData.adminName,
          adminEmail: createData.adminEmail,
          adminPassword: createData.adminPassword,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setCreateError(data.message || 'Failed to create organization & company admin');
      } else {
        setCreateSuccess(`Successfully created ${data.data.organization.name} and assigned Admin ${data.data.adminUser.email}`);
        fetchData();
        setTimeout(() => {
          setCreateModalOpen(false);
          setCreateSuccess(null);
        }, 1500);
      }
    } catch (err: any) {
      setCreateError(err.message || 'An error occurred during organization creation');
    } finally {
      setCreating(false);
    }
  };

  // Group modules by domain
  const moduleGroups = Array.from(new Set(MODULES.map((m) => m.group)));

  // Filter organizations
  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.slug.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ? true : org.subscriptionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalMRR = organizations.reduce((acc, o) => acc + (o.monthlyPrice || 0), 0);
  const totalEmployees = organizations.reduce((acc, o) => acc + (o.employeeCount || 0), 0);

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header Banner */}
      <div
        className="glass-card"
        style={{
          padding: 28,
          marginBottom: 28,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 50%, rgba(16,185,129,0.05) 100%)',
          border: '1px solid var(--surface-border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
              }}
            >
              <Building2 size={30} color="white" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--brand-500)',
                    background: 'rgba(99,102,241,0.15)',
                    padding: '2px 8px',
                    borderRadius: 4,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Super Admin Management
                </span>
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Organizations & Module Sales
              </h1>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: 14 }}
          >
            <Plus size={18} /> Add Organization & Company Admin
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div className="glass-card stats-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Total Organizations</span>
            <Building2 size={18} color="var(--brand-500)" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{organizations.length}</div>
          <div style={{ fontSize: 12, color: 'var(--color-success)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            Active tenants
          </div>
        </div>

        <div className="glass-card stats-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Platform MRR</span>
            <DollarSign size={18} color="var(--color-success)" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
            ₹{totalMRR.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Monthly Recurring Revenue</div>
        </div>

        <div className="glass-card stats-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Managed Employees</span>
            <Users size={18} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{totalEmployees}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Across all client orgs</div>
        </div>

        <div className="glass-card stats-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Platform Modules</span>
            <Package size={18} color="var(--color-warning)" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>48</div>
          <div style={{ fontSize: 12, color: 'var(--color-warning)', marginTop: 4 }}>Available for sale</div>
        </div>
      </div>

      {/* Main Content Area: Search, Filter, Data Table */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['ALL', 'ACTIVE', 'TRIAL', 'SUSPENDED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={statusFilter === st ? 'btn btn-primary' : 'btn btn-secondary'}
                style={{ padding: '7px 14px', fontSize: 12 }}
              >
                {st === 'ALL' ? 'All Organizations' : st}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, flex: 1, maxWidth: 360 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search organizations by name or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 36, fontSize: 13 }}
              />
            </div>
          </div>
        </div>

        {/* Organizations Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Subscription Plan</th>
                <th>Status</th>
                <th>Employees</th>
                <th>Active Modules</th>
                <th>MRR</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    Loading organizations...
                  </td>
                </tr>
              ) : filteredOrgs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    No organizations found matching query.
                  </td>
                </tr>
              ) : (
                filteredOrgs.map((org) => (
                  <tr key={org._id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>{org.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{org.slug}</div>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          background: 'rgba(99,102,241,0.12)',
                          color: 'var(--brand-500)',
                        }}
                      >
                        {org.planName || 'Custom Plan'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          org.subscriptionStatus === 'ACTIVE'
                            ? 'badge-active'
                            : org.subscriptionStatus === 'TRIAL'
                            ? 'badge-probation'
                            : 'badge-notice'
                        }`}
                      >
                        {org.subscriptionStatus}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{org.employeeCount}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}> / {org.settings?.maxEmployees || 100}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>{org.enabledModulesCount}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/ 48 modules</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      ₹{(org.monthlyPrice || 0).toLocaleString('en-IN')}/mo
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => openModuleDrawer(org)}
                        className="btn btn-primary"
                        style={{ padding: '6px 14px', fontSize: 12 }}
                      >
                        <Layers size={14} /> Sell & Manage Modules
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL SCREEN CREATE NEW ORGANIZATION & COMPANY ADMIN MODAL */}
      {createModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            background: 'var(--surface-bg)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            overflow: 'hidden',
          }}
        >
          {/* Top Sticky Header */}
          <div
            style={{
              padding: '16px 36px',
              background: 'var(--surface-card)',
              borderBottom: '1px solid var(--surface-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20,
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
                }}
              >
                <UserCheck size={24} color="white" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: 'var(--brand-500)',
                      background: 'rgba(99,102,241,0.15)',
                      padding: '2px 8px',
                      borderRadius: 4,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    FULL SCREEN PROVISIONING ENGINE
                  </span>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Create Organization & Provision Company Admin
                </h2>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="btn btn-secondary"
                style={{ padding: '8px 18px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateOrganizationAndAdmin}
                disabled={creating}
                className="btn btn-primary"
                style={{ padding: '8px 22px' }}
              >
                {creating ? 'Creating Company & Admin...' : 'Create Company & Assign Admin'}
              </button>
              <button
                onClick={() => setCreateModalOpen(false)}
                style={{
                  background: 'var(--surface-elevated)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: 10,
                  width: 38,
                  height: 38,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Form Content Controls Sub-Header */}
          <div
            style={{
              padding: '20px 36px',
              background: 'var(--surface-card)',
              borderBottom: '1px solid var(--surface-border)',
              flexShrink: 0,
            }}
          >
            {createError && (
              <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--color-danger)', padding: 12, borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                {createError}
              </div>
            )}

            {createSuccess && (
              <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: 'var(--color-success)', padding: 12, borderRadius: 8, fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} /> {createSuccess}
              </div>
            )}

            {/* Top Grid: Org & Admin Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div>
                <label className="form-label">Company / Org Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Acme Corp"
                  value={createData.organizationName}
                  onChange={(e) => setCreateData({ ...createData, organizationName: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Custom Slug (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. acme-corp"
                  value={createData.slug}
                  onChange={(e) => setCreateData({ ...createData, slug: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Admin Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    className="form-input"
                    style={{ paddingLeft: 36 }}
                    placeholder="e.g. John Doe"
                    value={createData.adminName}
                    onChange={(e) => setCreateData({ ...createData, adminName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Admin Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    required
                    className="form-input"
                    style={{ paddingLeft: 36 }}
                    placeholder="admin@company.com"
                    value={createData.adminEmail}
                    onChange={(e) => setCreateData({ ...createData, adminEmail: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Initial Admin Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    required
                    className="form-input"
                    style={{ paddingLeft: 36 }}
                    placeholder="Password@123"
                    value={createData.adminPassword}
                    onChange={(e) => setCreateData({ ...createData, adminPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Licensing & Billing Model Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, paddingTop: 16, borderTop: '1px solid var(--surface-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Licensing & Billing Model:</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setCreateLicensingMode('PLAN')}
                    className={`btn ${createLicensingMode === 'PLAN' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '6px 16px', fontSize: 12 }}
                  >
                    <Sparkles size={13} /> Predefined Plan Tier
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateLicensingMode('CUSTOM')}
                    className={`btn ${createLicensingMode === 'CUSTOM' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '6px 16px', fontSize: 12 }}
                  >
                    <Sliders size={13} /> Module-Based / Category Custom
                  </button>
                </div>
              </div>

              {createLicensingMode === 'PLAN' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Plan Tier:</span>
                  <select
                    className="form-input"
                    value={createData.planId}
                    onChange={(e) => handlePlanChangeInCreate(e.target.value)}
                    style={{ padding: '6px 14px', fontSize: 13, minWidth: 260 }}
                  >
                    {plans.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.name} - ₹{p.monthlyPrice}/mo ({p.includedModules?.length || 0} Modules)
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-success)' }}>
                    {createData.enabledModules.length} / 48 Modules Enabled
                  </span>
                  <button
                    type="button"
                    onClick={() => setCreateData({ ...createData, enabledModules: MODULES.map((m) => m.slug) })}
                    className="btn btn-secondary"
                    style={{ padding: '5px 12px', fontSize: 11 }}
                  >
                    Select All 48
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateData({ ...createData, enabledModules: [] })}
                    className="btn btn-danger"
                    style={{ padding: '5px 12px', fontSize: 11 }}
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Domain Navigation Tabs */}
          <div
            style={{
              padding: '0 36px',
              background: 'var(--surface-card)',
              borderBottom: '1px solid var(--surface-border)',
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={() => setCreateDomainFilter('ALL')}
              className={`domain-tab ${createDomainFilter === 'ALL' ? 'domain-tab-active' : ''}`}
            >
              All Domains (48)
            </button>
            {moduleGroups.map((group) => {
              const groupMods = MODULES.filter((m) => m.group === group);
              const activeInGroup = groupMods.filter((m) => createData.enabledModules.includes(m.slug)).length;
              const isSelected = createDomainFilter === group;

              return (
                <button
                  key={group}
                  type="button"
                  onClick={() => setCreateDomainFilter(group)}
                  className={`domain-tab ${isSelected ? 'domain-tab-active' : ''}`}
                >
                  <span>{group}</span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 10,
                      background: activeInGroup > 0 ? 'rgba(16,185,129,0.18)' : 'var(--surface-hover)',
                      color: activeInGroup > 0 ? 'var(--color-success)' : 'var(--text-secondary)',
                    }}
                  >
                    {activeInGroup}/{groupMods.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Full Screen Scrollable Module Grid */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '32px 36px 60px 36px',
              background: 'var(--surface-bg)',
            }}
          >
            {moduleGroups
              .filter((group) => createDomainFilter === 'ALL' || createDomainFilter === group)
              .map((group) => {
                const groupMods = MODULES.filter((m) => m.group === group);
                const activeCount = groupMods.filter((m) => createData.enabledModules.includes(m.slug)).length;
                const isAllInGroupSelected = groupMods.every((m) => createData.enabledModules.includes(m.slug));

                return (
                  <div key={group} style={{ marginBottom: 36 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--surface-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                          {group}
                        </h3>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-success)', background: 'rgba(16,185,129,0.12)', padding: '2px 10px', borderRadius: 12 }}>
                          {activeCount} of {groupMods.length} Active
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectAllInDomainInCreate(group)}
                        className="btn btn-secondary"
                        style={{ padding: '4px 12px', fontSize: 11 }}
                      >
                        {isAllInGroupSelected ? 'Deselect Domain' : 'Select Domain'}
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                      {groupMods.map((mod: ModuleDef) => {
                        const isChecked = createData.enabledModules.includes(mod.slug);
                        return (
                          <div
                            key={mod.slug}
                            onClick={() => handleToggleModuleInCreate(mod.slug)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '16px 18px',
                              borderRadius: 14,
                              cursor: 'pointer',
                              background: isChecked
                                ? 'linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(124,58,237,0.06) 100%)'
                                : 'var(--surface-card)',
                              border: isChecked ? '1px solid var(--brand-500)' : '1px solid var(--surface-border)',
                              boxShadow: isChecked ? '0 8px 20px rgba(79,70,229,0.12)' : 'none',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: 7,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: isChecked ? 'var(--brand-500)' : 'var(--surface-elevated)',
                                  color: isChecked ? 'white' : 'var(--text-muted)',
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                {isChecked && <Check size={16} strokeWidth={3} />}
                              </div>

                              <div>
                                <div style={{ fontSize: 14, fontWeight: isChecked ? 700 : 500, color: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                  {mod.name}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                  {mod.submodules?.length || 0} submodules
                                </div>
                              </div>
                            </div>

                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: isChecked ? 'var(--color-success)' : 'var(--text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                              }}
                            >
                              {isChecked ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* FULL-SCREEN Module Selling & Configurator Modal */}
      {selectedOrg && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            background: 'var(--surface-bg)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            overflow: 'hidden',
          }}
        >
          {/* Top Sticky Header Bar */}
          <div
            style={{
              padding: '16px 36px',
              background: 'var(--surface-card)',
              borderBottom: '1px solid var(--surface-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20,
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
                }}
              >
                <Layers size={24} color="white" />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: 'var(--brand-500)',
                      background: 'rgba(99,102,241,0.15)',
                      padding: '2px 8px',
                      borderRadius: 4,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    FULL SCREEN LICENSING ENGINE
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tenant: {selectedOrg.slug}</span>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Module Allocator — {selectedOrg.name}
                </h2>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Selected Modules</span>
                <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-success)' }}>
                  {selectedModules.length} <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/ 48</span>
                </span>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setSelectedOrg(null)} className="btn btn-secondary" style={{ padding: '8px 18px' }}>
                  Cancel
                </button>
                <button onClick={handleSaveModules} disabled={saving} className="btn btn-primary" style={{ padding: '8px 20px' }}>
                  {saving ? 'Saving...' : 'Save & Update Licensing'}
                </button>
                <button
                  onClick={() => setSelectedOrg(null)}
                  style={{
                    background: 'var(--surface-elevated)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: 10,
                    width: 38,
                    height: 38,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Sub-Header: Presets & Tier Controls */}
          <div
            style={{
              padding: '16px 36px',
              background: 'var(--surface-card)',
              borderBottom: '1px solid var(--surface-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Apply Plan Bundle:</span>
              {plans.map((p) => (
                <button
                  key={p.slug}
                  onClick={() => handleApplyPlanModules(p.slug)}
                  className={`btn ${selectedPlanId === p.slug ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 14px', fontSize: 12 }}
                >
                  <Sparkles size={13} /> {p.name} ({p.includedModules?.length || 0} mods)
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Capacity Limit:</span>
                <input
                  type="number"
                  className="form-input"
                  value={maxEmployees}
                  onChange={(e) => setMaxEmployees(Number(e.target.value))}
                  style={{ width: 100, padding: '6px 10px', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Subscription Tier:</span>
                <select
                  className="form-input"
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  style={{ padding: '6px 14px', fontSize: 13 }}
                >
                  {plans.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name} (₹{p.monthlyPrice}/mo)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 8, marginLeft: 12 }}>
                <button onClick={handleSelectAllModules} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: 12 }}>
                  Select All 48
                </button>
                <button onClick={() => setSelectedModules([])} className="btn btn-danger" style={{ padding: '6px 14px', fontSize: 12 }}>
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Sticky Domain Navigation Tabs Bar */}
          <div
            style={{
              padding: '0 36px',
              background: 'var(--surface-card)',
              borderBottom: '1px solid var(--surface-border)',
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={() => setActiveGroupFilter('ALL')}
              className={`domain-tab ${activeGroupFilter === 'ALL' ? 'domain-tab-active' : ''}`}
            >
              All Domains (48)
            </button>
            {moduleGroups.map((group) => {
              const groupMods = MODULES.filter((m) => m.group === group);
              const activeInGroup = groupMods.filter((m) => selectedModules.includes(m.slug)).length;
              const isSelected = activeGroupFilter === group;

              return (
                <button
                  key={group}
                  type="button"
                  onClick={() => setActiveGroupFilter(group)}
                  className={`domain-tab ${isSelected ? 'domain-tab-active' : ''}`}
                >
                  <span>{group}</span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 10,
                      background: activeInGroup > 0 ? 'rgba(16,185,129,0.18)' : 'var(--surface-hover)',
                      color: activeInGroup > 0 ? 'var(--color-success)' : 'var(--text-secondary)',
                    }}
                  >
                    {activeInGroup}/{groupMods.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Full Screen Scrollable Module Grid Container */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '32px 36px 60px 36px',
              background: 'var(--surface-bg)',
            }}
          >
            {moduleGroups
              .filter((group) => activeGroupFilter === 'ALL' || activeGroupFilter === group)
              .map((group) => {
                const groupMods = MODULES.filter((m) => m.group === group);
                const activeCount = groupMods.filter((m) => selectedModules.includes(m.slug)).length;
                const isAllInGroupSelected = groupMods.every((m) => selectedModules.includes(m.slug));

                return (
                  <div key={group} style={{ marginBottom: 36 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--surface-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                          {group}
                        </h3>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-success)', background: 'rgba(16,185,129,0.12)', padding: '2px 10px', borderRadius: 12 }}>
                          {activeCount} of {groupMods.length} Active
                        </span>
                      </div>

                      <button
                        onClick={() => handleSelectAllInGroup(group)}
                        className="btn btn-secondary"
                        style={{ padding: '4px 12px', fontSize: 11 }}
                      >
                        {isAllInGroupSelected ? 'Deselect Domain' : 'Select Domain'}
                      </button>
                    </div>

                    {/* Module Cards Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                      {groupMods.map((mod: ModuleDef) => {
                        const isChecked = selectedModules.includes(mod.slug);
                        return (
                          <div
                            key={mod.slug}
                            onClick={() => handleToggleModule(mod.slug)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '16px 18px',
                              borderRadius: 14,
                              cursor: 'pointer',
                              background: isChecked
                                ? 'linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(124,58,237,0.06) 100%)'
                                : 'var(--surface-card)',
                              border: isChecked ? '1px solid var(--brand-500)' : '1px solid var(--surface-border)',
                              boxShadow: isChecked ? '0 8px 20px rgba(79,70,229,0.12)' : 'none',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: 7,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: isChecked ? 'var(--brand-500)' : 'var(--surface-elevated)',
                                  color: isChecked ? 'white' : 'var(--text-muted)',
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                {isChecked && <Check size={16} strokeWidth={3} />}
                              </div>

                              <div>
                                <div style={{ fontSize: 14, fontWeight: isChecked ? 700 : 500, color: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                  {mod.name}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                  {mod.submodules?.length || 0} submodules
                                </div>
                              </div>
                            </div>

                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: isChecked ? 'var(--color-success)' : 'var(--text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                              }}
                            >
                              {isChecked ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
