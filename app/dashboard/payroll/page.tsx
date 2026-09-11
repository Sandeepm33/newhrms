'use client';

import { useState, useEffect } from 'react';
import {
  Banknote,
  Play,
  Download,
  Users,
  RefreshCw,
} from 'lucide-react';

interface PayrollRunItem {
  _id: string;
  period: string;
  totalGross: number;
  statutoryDeductions: number;
  netPayable: number;
  payeesCount: number;
  status: string;
  processedDate: string;
}

interface PayrollStats {
  estPayroll: number;
  estDeductions: number;
  activePayees: number;
}

export default function PayrollPage() {
  const [runs, setRuns] = useState<PayrollRunItem[]>([]);
  const [stats, setStats] = useState<PayrollStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    fetchPayrollData();
  }, []);

  const fetchPayrollData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payroll');
      const data = await res.json();
      if (data.success) {
        setRuns(data.data.runs || []);
        setStats(data.data.stats || null);
      }
    } catch (err) {
      console.error('Failed to load payroll data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunPayroll = async () => {
    setRunning(true);
    try {
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (data.success) {
        fetchPayrollData();
      } else {
        alert(data.message || 'Payroll run failed');
      }
    } catch (err) {
      console.error('Failed to run payroll:', err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header */}
      <div
        className="glass-card"
        style={{
          padding: 28,
          marginBottom: 28,
          background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(99,102,241,0.08) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Banknote size={26} color="#10b981" />
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Payroll Management & Processing
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14 }}>
            Process monthly salary runs, statutory deductions (PF/ESI/TDS), and bulk payslips
          </p>
        </div>

        <button
          onClick={handleRunPayroll}
          disabled={running}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', fontSize: 14 }}
        >
          <Play size={16} /> {running ? 'Processing Payroll...' : 'Run Payroll Execution'}
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 28 }}>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Est. Monthly Payroll</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>
            ₹ {(stats?.estPayroll ?? 0).toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: 11, color: '#10b981', marginTop: 4, display: 'inline-block' }}>Current Cycle</span>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Statutory Deductions</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>
            ₹ {(stats?.estDeductions ?? 0).toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'inline-block' }}>PF, ESI & TDS</span>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Active Payees</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={20} color="#10b981" /> {stats?.activePayees ?? 0} Employees
          </div>
          <span style={{ fontSize: 11, color: '#10b981', marginTop: 4, display: 'inline-block' }}>Direct Bank Transfer</span>
        </div>
      </div>

      {/* Payroll Runs History */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Payroll Execution History
          </h3>
          <button onClick={fetchPayrollData} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
            <RefreshCw size={14} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading payroll records...</div>
        ) : runs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No payroll runs executed yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-muted)', fontSize: 12 }}>
                  <th style={{ padding: '12px 16px' }}>Payroll Period</th>
                  <th style={{ padding: '12px 16px' }}>Payees</th>
                  <th style={{ padding: '12px 16px' }}>Gross Total</th>
                  <th style={{ padding: '12px 16px' }}>Net Disbursement</th>
                  <th style={{ padding: '12px 16px' }}>Processed Date</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run._id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{run.period}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{run.payeesCount}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>₹ {run.totalGross.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#10b981' }}>₹ {run.netPayable.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                      {new Date(run.processedDate).toLocaleDateString('en-GB')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                        {run.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>
                        <Download size={13} style={{ marginRight: 4 }} /> Payslips
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
