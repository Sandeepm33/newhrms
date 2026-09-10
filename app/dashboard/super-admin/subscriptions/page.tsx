'use client';

import { useState, useEffect } from 'react';
import { MODULES } from '@/config/modules';
import {
  CreditCard,
  Plus,
  Check,
  Edit2,
  Sparkles,
  Users,
  Layers,
  Zap,
  Shield,
  Star,
  CheckCircle2,
} from 'lucide-react';

interface PlanItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  maxEmployees: number;
  includedModules: string[];
  features: string[];
  isPopular: boolean;
  isActive: boolean;
}

export default function SuperAdminSubscriptionsPage() {
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    monthlyPrice: 4999,
    annualPrice: 49990,
    maxEmployees: 100,
    includedModules: [] as string[],
    featuresText: '',
    isPopular: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/super-admin/plans');
      const data = await res.json();
      if (data.success) setPlans(data.data);
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (plan?: PlanItem) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        slug: plan.slug,
        description: plan.description,
        monthlyPrice: plan.monthlyPrice,
        annualPrice: plan.annualPrice,
        maxEmployees: plan.maxEmployees,
        includedModules: plan.includedModules || [],
        featuresText: (plan.features || []).join('\n'),
        isPopular: plan.isPopular,
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        monthlyPrice: 4999,
        annualPrice: 49990,
        maxEmployees: 100,
        includedModules: ['dashboard', 'employees', 'attendance', 'leave', 'payroll'],
        featuresText: 'Up to 100 Employees\nCore HR & Directory\nPayroll & Tax Automation\nPriority Support',
        isPopular: false,
      });
    }
    setModalOpen(true);
  };

  const handleToggleModule = (slug: string) => {
    setFormData((prev) => ({
      ...prev,
      includedModules: prev.includedModules.includes(slug)
        ? prev.includedModules.filter((s) => s !== slug)
        : [...prev.includedModules, slug],
    }));
  };

  const handleSavePlan = async () => {
    setSaving(true);
    try {
      const features = formData.featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const payload = {
        ...(editingPlan ? { id: editingPlan._id } : {}),
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        monthlyPrice: Number(formData.monthlyPrice),
        annualPrice: Number(formData.annualPrice),
        maxEmployees: Number(formData.maxEmployees),
        includedModules: formData.includedModules,
        features,
        isPopular: formData.isPopular,
      };

      const res = await fetch('/api/super-admin/plans', {
        method: editingPlan ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        fetchPlans();
      }
    } catch (err) {
      console.error('Failed to save plan:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', paddingBottom: 60 }}>
      {/* Banner */}
      <div
        className="glass-card"
        style={{
          padding: 28,
          marginBottom: 28,
          background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(99,102,241,0.1) 50%, rgba(236,72,153,0.05) 100%)',
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
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(139,92,246,0.3)',
              }}
            >
              <CreditCard size={30} color="white" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#c084fc',
                    background: 'rgba(168,85,247,0.15)',
                    padding: '2px 8px',
                    borderRadius: 4,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Subscription Pricing Engine
                </span>
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                SaaS Subscription Plans & Bundles
              </h1>
            </div>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Plus size={16} /> Create Subscription Tier
          </button>
        </div>
      </div>

      {/* Plans Pricing Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading subscription plans...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {plans.map((plan) => (
            <div
              key={plan._id}
              className="glass-card animate-fade-in"
              style={{
                padding: 28,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                border: plan.isPopular ? '2px solid var(--brand-500)' : '1px solid var(--surface-border)',
                background: 'var(--surface-card)',
                boxShadow: plan.isPopular ? '0 8px 30px rgba(99,102,241,0.15)' : 'none',
              }}
            >
              {plan.isPopular && (
                <div
                  style={{
                    position: 'absolute',
                    top: -12,
                    right: 24,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: 'white',
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '4px 12px',
                    borderRadius: 20,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Star size={11} fill="white" /> Most Popular
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
                  {plan.name}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', minHeight: 38, lineHeight: 1.5 }}>{plan.description}</p>
              </div>

              {/* Price Tag */}
              <div style={{ marginBottom: 24, borderBottom: '1px solid var(--surface-border)', paddingBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 34, fontWeight: 800, color: 'var(--text-primary)' }}>
                    ₹{plan.monthlyPrice.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/ month</span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-success)', marginTop: 4 }}>
                  Annual plan: ₹{plan.annualPrice.toLocaleString('en-IN')}/year
                </div>
              </div>

              {/* Specs */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  <Users size={16} color="var(--brand-500)" />
                  <span>Up to {plan.maxEmployees} Employees</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  <Layers size={16} color="#8b5cf6" />
                  <span>{plan.includedModules?.length || 0} Included Modules</span>
                </div>

                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Key Features:
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {(plan.features || []).map((feat, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                      <CheckCircle2 size={14} color="var(--color-success)" style={{ flexShrink: 0 }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card Footer Button */}
              <div style={{ marginTop: 'auto' }}>
                <button
                  onClick={() => handleOpenModal(plan)}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', padding: '10px 0' }}
                >
                  <Edit2 size={14} /> Edit Plan Details & Modules
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plan Builder Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: 20,
          }}
        >
          <div
            className="glass-card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: 850,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              padding: 28,
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>
              {editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Tier'}
            </h2>

            <div style={{ overflowY: 'auto', flex: 1, paddingRight: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="form-label">Plan Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Growth Tier"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Plan Slug</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. growth"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Short description of this tier..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label className="form-label">Monthly Price (INR)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.monthlyPrice}
                    onChange={(e) => setFormData({ ...formData, monthlyPrice: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="form-label">Annual Price (INR)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.annualPrice}
                    onChange={(e) => setFormData({ ...formData, annualPrice: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="form-label">Max Employee Limit</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.maxEmployees}
                    onChange={(e) => setFormData({ ...formData, maxEmployees: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="form-label">Features Bullet List (One per line)</label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={formData.featuresText}
                  onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                />
              </div>

              {/* Module Selector */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Bundled Modules ({formData.includedModules.length} selected)
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setFormData({ ...formData, includedModules: MODULES.map((m) => m.slug) })}
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: 11 }}
                    >
                      Select All 48
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, includedModules: [] })}
                      className="btn btn-danger"
                      style={{ padding: '4px 10px', fontSize: 11 }}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8, maxHeight: 220, overflowY: 'auto', padding: 12, background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: 10 }}>
                  {MODULES.map((mod) => {
                    const checked = formData.includedModules.includes(mod.slug);
                    return (
                      <div
                        key={mod.slug}
                        onClick={() => handleToggleModule(mod.slug)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 10px',
                          borderRadius: 6,
                          fontSize: 12,
                          cursor: 'pointer',
                          background: checked ? 'rgba(99,102,241,0.15)' : 'transparent',
                          color: checked ? 'var(--brand-500)' : 'var(--text-secondary)',
                          fontWeight: checked ? 700 : 400,
                        }}
                      >
                        <Check size={14} color={checked ? 'var(--brand-500)' : 'var(--text-muted)'} opacity={checked ? 1 : 0.3} />
                        <span>{mod.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--surface-border)' }}>
              <button onClick={() => setModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleSavePlan} disabled={saving} className="btn btn-primary">
                {saving ? 'Saving...' : 'Save Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
