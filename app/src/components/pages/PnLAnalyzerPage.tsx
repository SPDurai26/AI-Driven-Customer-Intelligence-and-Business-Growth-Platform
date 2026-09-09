'use client';

import React from 'react';
import { useApp } from '@/lib/app-context';
import { FileSpreadsheet, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function PnLAnalyzerPage() {
  const { pnlStatement, metrics, setCurrentPage } = useApp();
  const { revenue, costOfGoodsSold, expenses, businessName, reportingPeriod, currency } = pnlStatement;
  const currSymbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

  const lineItems = [
    { label: 'GROSS REVENUE / NET SALES', value: revenue, type: 'income', formula: 'Reported Topline Revenue' },
    { label: 'COST OF GOODS SOLD (COGS)', value: -costOfGoodsSold, type: 'cogs', formula: '= Direct material + manufacturing overhead' },
    { label: '━━ GROSS PROFIT', value: metrics.grossProfit, type: 'subtotal', formula: `= Revenue − COGS | ${metrics.grossMarginPercent.toFixed(1)}% Gross Margin` },
    { label: 'EMPLOYEE & PAYROLL EXPENSES', value: -expenses.employeeExpenses, type: 'expense', formula: 'Operating Payroll' },
    { label: 'RENT & UTILITIES', value: -expenses.rentAndUtilities, type: 'expense', formula: 'Fixed Facilities' },
    { label: 'MARKETING & ADVERTISING', value: -expenses.marketingExpenses, type: 'expense', formula: 'Acquisition Spend' },
    { label: 'DEPRECIATION & AMORTIZATION', value: -expenses.depreciation, type: 'expense', formula: 'Non-Cash Amortization' },
    { label: 'INTEREST & FINANCE CHARGES', value: -expenses.interestExpenses, type: 'expense', formula: 'Below-the-line' },
    { label: 'TAXES & STATUTORY LEVIES', value: -expenses.taxes, type: 'expense', formula: 'Statutory' },
    { label: 'OTHER MISCELLANEOUS OPEX', value: -expenses.otherExpenses, type: 'expense', formula: 'Sundry' },
    { label: '━━ TOTAL OPERATING EXPENSES', value: -metrics.totalOperatingExpenses, type: 'subtotal', formula: `${metrics.expenseRatioPercent.toFixed(1)}% Expense Ratio` },
    { label: '━━ OPERATING PROFIT (EBIT)', value: metrics.operatingProfit, type: 'subtotal', formula: `${metrics.operatingMarginPercent.toFixed(1)}% Operating Margin` },
    { label: '═══ NET PROFIT / (LOSS)', value: metrics.netProfit, type: 'net', formula: `${metrics.netMarginPercent.toFixed(1)}% Net Margin` },
  ];

  const isBalanced = Math.abs(
    metrics.netProfit - (revenue - costOfGoodsSold - metrics.totalOperatingExpenses)
  ) < 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Header */}
      <div className="hud-corner-box" style={{
        padding: '20px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 4,
            background: 'linear-gradient(135deg, #FF2E63 0%, #00F0FF 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 15px rgba(255, 46, 99, 0.4)', flexShrink: 0,
          }}>
            <FileSpreadsheet size={22} color="#000003" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontFamily: 'Orbitron', fontSize: 18, fontWeight: 900, color: '#FFFFFF' }}>
                PROFIT & LOSS STATEMENT AUDIT
              </h1>
              <span className={`badge ${isBalanced ? 'badge-uncommon' : 'badge-danger'}`} style={{ fontSize: 9 }}>
                {isBalanced ? '✓ 100% RECONCILED' : '⚠ AUDIT WARNING'}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Line-by-line financial ledger validation for <strong>{businessName}</strong> — {reportingPeriod} ({currency})
            </p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setCurrentPage('ai-cofounder')}>
          AI ACTION SPRINT <ArrowRight size={12} />
        </button>
      </div>

      {/* 5 Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {[
          { label: 'TOTAL REVENUE', value: `${currSymbol}${revenue.toLocaleString('en-US')}`, badge: 'AUDITED', isPos: true },
          { label: 'TOTAL COGS', value: `${currSymbol}${costOfGoodsSold.toLocaleString('en-US')}`, badge: 'DIRECT COST', isPos: false },
          { label: 'GROSS PROFIT', value: `${currSymbol}${metrics.grossProfit.toLocaleString('en-US')} (${metrics.grossMarginPercent.toFixed(1)}%)`, badge: 'MARGIN', isPos: metrics.grossProfit > 0 },
          { label: 'TOTAL OPEX', value: `${currSymbol}${metrics.totalOperatingExpenses.toLocaleString('en-US')}`, badge: 'OVERHEAD', isPos: false },
          { label: 'NET PROFIT / LOSS', value: `${currSymbol}${metrics.netProfit.toLocaleString('en-US')} (${metrics.netMarginPercent.toFixed(1)}%)`, badge: 'BOTTOM LINE', isPos: metrics.netProfit >= 0 },
        ].map((item, idx) => (
          <div key={idx} className="hud-corner-box" style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 9, fontFamily: 'Orbitron', fontWeight: 700, color: 'var(--text-muted)' }}>{item.label}</span>
              <span className={`badge ${item.isPos ? 'badge-uncommon' : 'badge-danger'}`} style={{ fontSize: 8 }}>{item.badge}</span>
            </div>
            <div style={{
              fontFamily: 'Orbitron', fontSize: 18, fontWeight: 900,
              color: item.isPos ? '#FFFFFF' : 'var(--cyber-red)',
            }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Line-item Audit Table */}
      <div className="hud-corner-box" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-hud)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 800, color: '#FFFFFF' }}>
            INCOME STATEMENT LEDGER ENTRIES
          </h3>
          {isBalanced
            ? <span className="badge badge-uncommon"><CheckCircle2 size={11} /> ALL ENTRIES RECONCILED</span>
            : <span className="badge badge-danger"><AlertTriangle size={11} /> VERIFICATION REQUIRED</span>
          }
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Line Item Description</th>
              <th style={{ textAlign: 'right' }}>Amount ({currency})</th>
              <th>Accounting Formula / Sub-Category</th>
              <th style={{ textAlign: 'right' }}>% of Revenue</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, idx) => {
              const isSubtotal = item.type === 'subtotal' || item.type === 'net';
              const isNet = item.type === 'net';
              const pctOfRev = revenue > 0 ? (Math.abs(item.value) / revenue) * 100 : 0;
              return (
                <tr key={idx} style={{
                  background: isNet ? 'rgba(255,46,99,0.08)' : isSubtotal ? 'rgba(255,255,255,0.02)' : 'transparent',
                }}>
                  <td style={{
                    fontWeight: isSubtotal ? 800 : 600,
                    color: isSubtotal ? '#FFFFFF' : 'var(--text-secondary)',
                    fontFamily: isSubtotal ? 'Orbitron' : 'Rajdhani',
                    fontSize: isSubtotal ? 12 : 13,
                    paddingLeft: isSubtotal ? '18px' : '28px',
                  }}>
                    {item.label}
                  </td>
                  <td style={{
                    textAlign: 'right',
                    fontWeight: 800,
                    fontFamily: 'JetBrains Mono',
                    color: item.value < 0 ? 'var(--cyber-red)' : item.value >= 0 ? 'var(--cyber-emerald)' : '#FFFFFF',
                    fontSize: isNet ? 15 : 13,
                  }}>
                    {item.value < 0 ? `(${currSymbol}${Math.abs(item.value).toLocaleString('en-US')})` : `${currSymbol}${item.value.toLocaleString('en-US')}`}
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Rajdhani' }}>{item.formula}</td>
                  <td style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                    {!isSubtotal && revenue > 0 ? `${pctOfRev.toFixed(1)}%` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
