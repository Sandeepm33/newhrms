'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Search, Filter, ChevronLeft, ChevronRight, Eye, Pencil } from 'lucide-react';
import Link from 'next/link';
import { formatDate, getInitials } from '@/lib/utils';

interface Employee {
  _id: string;
  employeeCode: string;
  status: string;
  joiningDate?: string;
  personal?: { firstName?: string; lastName?: string; displayName?: string; avatar?: string; personalEmail?: string };
  department?: { name?: string };
  designation?: { name?: string };
  location?: { name?: string };
}

interface ApiResponse {
  success: boolean;
  data: Employee[];
  pagination?: { page: number; total: number; totalPages: number; limit: number };
}

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'badge-active',
  PROBATION: 'badge-probation',
  NOTICE_PERIOD: 'badge-notice',
  TERMINATED: 'badge-inactive',
  RESIGNED: 'badge-inactive',
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState('');

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      });
      const res = await fetch(`/api/employees?${params.toString()}`);
      const data = await res.json() as ApiResponse;
      if (data.success) {
        setEmployees(data.data);
        if (data.pagination) setPagination({ total: data.pagination.total, totalPages: data.pagination.totalPages });
      }
    } catch {
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => void fetchEmployees(), search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchEmployees, search]);

  function getStatusLabel(status: string) {
    return status.replace('_', ' ');
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            Employees
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            {pagination.total > 0 ? `${pagination.total} employees` : 'Manage your workforce'}
          </p>
        </div>
        <Link href="/dashboard/employees/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <UserPlus size={16} />
          Add Employee
        </Link>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by name, code, email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="form-input"
            style={{ paddingLeft: 36 }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="form-input"
          style={{ width: 160 }}
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="PROBATION">Probation</option>
          <option value="NOTICE_PERIOD">Notice Period</option>
          <option value="TERMINATED">Terminated</option>
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12 }}>
          <Filter size={14} />
          {statusFilter || search ? 'Filtered' : 'All employees'}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 24 }}>
            {[1,2,3,4,5].map((i) => (
              <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--surface-border)' }}>
                <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 12, width: '25%' }} />
                </div>
                <div className="skeleton" style={{ height: 12, width: 80 }} />
                <div className="skeleton" style={{ height: 12, width: 80 }} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>{error}</div>
        ) : employees.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
              {search || statusFilter ? 'No employees match your filters' : 'No employees yet'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
              {search || statusFilter
                ? 'Try adjusting your search or filter'
                : 'Start by adding your first employee to the system'}
            </p>
            {!search && !statusFilter && (
              <Link href="/dashboard/employees/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                <UserPlus size={16} /> Add First Employee
              </Link>
            )}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Code</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Location</th>
                <th>Joining Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const fullName = emp.personal?.displayName
                  ?? `${emp.personal?.firstName ?? ''} ${emp.personal?.lastName ?? ''}`.trim()
                  ?? 'Unknown';

                return (
                  <tr key={emp._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0,
                        }}>
                          {getInitials(fullName)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>
                            {fullName}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {emp.personal?.personalEmail ?? ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--brand-400)', fontSize: 12 }}>
                      {emp.employeeCode}
                    </td>
                    <td>{emp.department?.name ?? '—'}</td>
                    <td>{emp.designation?.name ?? '—'}</td>
                    <td>{emp.location?.name ?? '—'}</td>
                    <td>{emp.joiningDate ? formatDate(emp.joiningDate) : '—'}</td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[emp.status] ?? 'badge-inactive'}`}>
                        {getStatusLabel(emp.status)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link
                          href={`/dashboard/employees/${emp._id}`}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 30, height: 30, borderRadius: 8,
                            background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)',
                            color: 'var(--text-secondary)', textDecoration: 'none',
                          }}
                          title="View"
                        >
                          <Eye size={13} />
                        </Link>
                        <Link
                          href={`/dashboard/employees/${emp._id}/edit`}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 30, height: 30, borderRadius: 8,
                            background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)',
                            color: 'var(--text-secondary)', textDecoration: 'none',
                          }}
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderTop: '1px solid var(--surface-border)',
          }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Page {page} of {pagination.totalPages} — {pagination.total} total
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: 12 }}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: 12 }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
