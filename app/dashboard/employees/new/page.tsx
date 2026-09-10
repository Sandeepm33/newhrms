'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Loader2, User, Building, MapPin, Briefcase, Users } from 'lucide-react';
import Link from 'next/link';

interface SelectOption { _id: string; name: string; }
interface FormData {
  firstName: string; lastName: string; personalEmail: string; workEmail: string;
  phone: string; dateOfBirth: string; gender: string; joiningDate: string;
  employeeCode: string; departmentId: string; designationId: string;
  locationId: string; reportingManagerId: string; employmentTypeId: string;
}

export default function NewEmployeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState<SelectOption[]>([]);
  const [designations, setDesignations] = useState<SelectOption[]>([]);
  const [locations, setLocations] = useState<SelectOption[]>([]);
  const [managers, setManagers] = useState<SelectOption[]>([]);

  const [form, setForm] = useState<FormData>({
    firstName: '', lastName: '', personalEmail: '', workEmail: '',
    phone: '', dateOfBirth: '', gender: '', joiningDate: new Date().toISOString().split('T')[0] ?? '',
    employeeCode: '', departmentId: '', designationId: '',
    locationId: '', reportingManagerId: '', employmentTypeId: '',
  });

  useEffect(() => {
    async function loadDropdowns() {
      const [depts, desig, locs, emps] = await Promise.allSettled([
        fetch('/api/departments').then(r => r.json()) as Promise<{ data?: SelectOption[] }>,
        fetch('/api/designations').then(r => r.json()) as Promise<{ data?: SelectOption[] }>,
        fetch('/api/locations').then(r => r.json()) as Promise<{ data?: SelectOption[] }>,
        fetch('/api/employees?limit=200').then(r => r.json()) as Promise<{ data?: Array<{ _id: string; personal?: { displayName?: string; firstName?: string; lastName?: string } }> }>,
      ]);

      if (depts.status === 'fulfilled') setDepartments(depts.value?.data ?? []);
      if (desig.status === 'fulfilled') setDesignations(desig.value?.data ?? []);
      if (locs.status === 'fulfilled') setLocations(locs.value?.data ?? []);
      if (emps.status === 'fulfilled') {
        setManagers(
          (emps.value?.data ?? []).map(e => ({
            _id: e._id,
            name: e.personal?.displayName ?? `${e.personal?.firstName ?? ''} ${e.personal?.lastName ?? ''}`.trim(),
          }))
        );
      }
    }
    void loadDropdowns();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json() as { success?: boolean; data?: { employeeId: string }; message?: string };
    setLoading(false);

    if (data.success) {
      router.push(`/dashboard/employees/${data.data?.employeeId ?? ''}`);
    } else {
      setError(data.message ?? 'Failed to create employee');
    }
  }

  const Section = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
    <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--surface-border)' }}>
        <Icon size={16} color="#6366f1" />
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {children}
      </div>
    </div>
  );

  const Field = ({ label, id, children }: { label: string; id: string; children: React.ReactNode }) => (
    <div>
      <label htmlFor={id} className="form-label">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <Link
          href="/dashboard/employees"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)',
            color: 'var(--text-secondary)', textDecoration: 'none',
          }}
        >
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>Add New Employee</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Fill in the details to create an employee record</p>
        </div>
      </div>

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
        {/* Personal Info */}
        <Section title="Personal Information" icon={User}>
          <Field label="First Name *" id="firstName">
            <input id="firstName" className="form-input" required value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="John" />
          </Field>
          <Field label="Last Name *" id="lastName">
            <input id="lastName" className="form-input" required value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Doe" />
          </Field>
          <Field label="Personal Email" id="personalEmail">
            <input id="personalEmail" type="email" className="form-input" value={form.personalEmail}
              onChange={(e) => setForm({ ...form, personalEmail: e.target.value })} placeholder="john@gmail.com" />
          </Field>
          <Field label="Phone" id="phone">
            <input id="phone" className="form-input" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
          </Field>
          <Field label="Date of Birth" id="dateOfBirth">
            <input id="dateOfBirth" type="date" className="form-input" value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
          </Field>
          <Field label="Gender" id="gender">
            <select id="gender" className="form-input" value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="">Select</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
              <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
            </select>
          </Field>
        </Section>

        {/* Employment */}
        <Section title="Employment Details" icon={Briefcase}>
          <Field label="Employee Code" id="employeeCode">
            <input id="employeeCode" className="form-input" value={form.employeeCode}
              onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
              placeholder="Auto-generated if blank" />
          </Field>
          <Field label="Work Email" id="workEmail">
            <input id="workEmail" type="email" className="form-input" value={form.workEmail}
              onChange={(e) => setForm({ ...form, workEmail: e.target.value })} placeholder="john@company.com" />
          </Field>
          <Field label="Joining Date" id="joiningDate">
            <input id="joiningDate" type="date" className="form-input" value={form.joiningDate}
              onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} />
          </Field>
        </Section>

        {/* Organization */}
        <Section title="Organization Mapping" icon={Building}>
          <Field label="Department" id="departmentId">
            <select id="departmentId" className="form-input" value={form.departmentId}
              onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
              <option value="">Select Department</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </Field>
          <Field label="Designation" id="designationId">
            <select id="designationId" className="form-input" value={form.designationId}
              onChange={(e) => setForm({ ...form, designationId: e.target.value })}>
              <option value="">Select Designation</option>
              {designations.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </Field>
          <Field label="Location" id="locationId">
            <select id="locationId" className="form-input" value={form.locationId}
              onChange={(e) => setForm({ ...form, locationId: e.target.value })}>
              <option value="">Select Location</option>
              {locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
            </select>
          </Field>
          <Field label="Reporting Manager" id="reportingManagerId">
            <select id="reportingManagerId" className="form-input" value={form.reportingManagerId}
              onChange={(e) => setForm({ ...form, reportingManagerId: e.target.value })}>
              <option value="">Select Manager</option>
              {managers.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
          </Field>
        </Section>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Link href="/dashboard/employees" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? (
              <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Creating...</>
            ) : (
              <><Save size={16} /> Create Employee</>
            )}
          </button>
        </div>
      </form>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
