'use client';

import { useState } from 'react';
import {
  Banknote,
  Play,
  Receipt,
  Download,
  CheckCircle2,
  Clock,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

export default function PayrollPage() {
  const [running, setRunning] = useState(false);

  const payrollHistory = [
    { id: '1', month: 'August 2026', totalGross: '₹ 42,50,000', netPayable: '₹ 36,80,000', employees: 512, status: 'COMPLETED', processedDate: '31 Aug 2026' },
    { id: '2', month: 'July 2026', totalGross: '₹ 41,80,000', netPayable: '₹ 36,10,000', employees: 508, status: 'COMPLETED', processedDate: '31 Jul 2026' },
    { id: '3', month: 'June 2026', totalGross: '₹ 41,20,000', netPayable: '₹ 35,60,000', employees: 502, status: 'COMPLETED', processedDate: '30 Jun 2026' },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
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
          onClick={() => {
            setRunning(true);
            setTimeout(() => setRunning(false), 2000);
          }}
          disabled={running}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', fontSize: 14 }}
        >
          <Play size={16} /> {running ? 'Processing Payroll...' : 'Run Payroll (Sep 2026)'}
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 28 }}>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Est. Monthly Payroll</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>₹ 43,10,000</div>
          <span style={{ fontSize: 11, color: '#10b981', marginTop: 4, display: 'inline-block' }}>September 2026 Cycle</span>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Statutory Deductions</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>₹ 5,85,000</div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'inline-block' }}>PF, ESI, PT & TDS</span>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Active Payees</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>512 Employees</div>
          <span style={{ fontSize: 11, color: '#10b981', marginTop: 4, display: 'inline-block' }}>Direct Bank Transfer</span>
        </div>
      </div>

      {/* Payroll Runs History */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
          Payroll Execution History
        </h3>

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
              {payrollHistory.map((run) => (
                <tr key={run.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{run.month}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{run.employees}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{run.totalGross}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#10b981' }}>{run.netPayable}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{run.processedDate}</td>
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
      </div>
    </div>
  );
}
