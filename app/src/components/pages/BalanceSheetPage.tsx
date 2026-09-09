'use client';

import React from 'react';
import { useApp } from '@/lib/app-context';
import {
  Landmark, ShieldCheck, AlertTriangle, ArrowRight,
  TrendingUp, Scale, DollarSign, PieChart as PieIcon, CheckCircle2, RefreshCw
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';

export default function BalanceSheetPage() {
  const { balanceSheet, balanceSheetMetrics, setCurrentPage, setIsReportModalOpen } = useApp();
  const currSymbol = balanceSheet.currency === 'INR' ? '₹' : '$';
  const m = balanceSheetMetrics;
  const a = balanceSheet.assets;
  const l = balanceSheet.liabilities;
  const eq = balanceSheet.equity;

  const assetPieData = [
    { name: 'Cash & Equiv', value: a.cashAndEquivalents, fill: '#00FF88' },
    { name: 'Receivables', value: a.accountsReceivable, fill: '#00F0FF' },
    { name: 'Inventory', value: a.inventory, fill: '#FFB800' },
    { name: 'Prepaid Exp', value: a.prepaidExpenses, fill: '#8B5CF6' },
    { name: 'PP&E (Fixed)', value: a.propertyPlantEquipment, fill: '#FF2E63' },
    { name: 'Intangibles', value: a.intangibleAssets, fill: '#9945FF' },
    { name: 'Other Assets', value: a.otherAssets, fill: '#64748B' },
  ].filter(d => d.value > 0);

  const liabilityPieData = [
    { name: 'Accounts Payable', value: l.accountsPayable, fill: '#FF2E63' },
    { name: 'Short-Term Debt', value: l.shortTermDebt, fill: '#FF007F' },
    { name: 'Accrued Liab', value: l.accruedLiabilities, fill: '#FFB800' },
    { name: 'Long-Term Debt', value: l.longTermDebt, fill: '#E50914' },
    { name: 'Other Liab', value: l.otherLiabilities, fill: '#64748B' },
    { name: 'Paid-in Capital', value: eq.paidInCapital, fill: '#00FF88' },
    { name: 'Retained Earnings', value: eq.retainedEarnings, fill: '#00F0FF' },
  ].filter(d => d.value > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      
      {/* Header Banner */}
      <div className="hud-corner-box" style={{
        padding: '20px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 4,
            background: 'linear-gradient(135deg, #00F0FF 0%, #9945FF 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)', flexShrink: 0,
          }}>
            <Landmark size={22} color="#000003" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontFamily: 'Orbitron', fontSize: 18, fontWeight: 900, color: '#FFFFFF' }}>
                BALANCE SHEET & SOLVENCY ENGINE
              </h1>
              <span className={`badge ${m.solvencyScore >= 70 ? 'badge-uncommon' : 'badge-danger'}`} style={{ fontSize: 9 }}>
                {m.solvencyStatus.toUpperCase()}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Liquidity ratios and capital structure for <strong>{balanceSheet.businessName}</strong> ({balanceSheet.reportingDate}).
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-primary" onClick={() => setCurrentPage('ai-cofounder')}>
            AI LIQUIDITY SPRINT <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* 5 Core Solvency & Liquidity KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {[
          {
            label: 'NET WORKING CAPITAL',
            value: `${currSymbol}${m.workingCapital.toLocaleString('en-US')}`,
            sub: `${m.workingCapitalGrowthPercent >= 0 ? '+' : ''}${m.workingCapitalGrowthPercent.toFixed(1)}% VS PRIOR`,
            badge: m.workingCapital >= 0 ? 'SURPLUS' : 'DEFICIT',
            isPos: m.workingCapital >= 0,
          },
          {
            label: 'CURRENT RATIO',
            value: `${m.currentRatio.toFixed(2)}x`,
            sub: 'BENCHMARK: 1.5 - 2.0x',
            badge: m.currentRatio >= 1.5 ? 'OPTIMAL' : 'AT-RISK',
            isPos: m.currentRatio >= 1.5,
          },
          {
            label: 'QUICK ACID-TEST RATIO',
            value: `${m.quickRatio.toFixed(2)}x`,
            sub: 'EXCLUDES INVENTORY',
            badge: m.quickRatio >= 1.0 ? 'SAFE' : 'LOW CASH',
            isPos: m.quickRatio >= 1.0,
          },
          {
            label: 'DEBT-TO-EQUITY',
            value: `${m.debtToEquityRatio.toFixed(2)}x`,
            sub: 'FINANCIAL LEVERAGE',
            badge: m.debtToEquityRatio <= 1.0 ? 'HEALTHY' : 'LEVERAGED',
            isPos: m.debtToEquityRatio <= 1.0,
          },
          {
            label: 'TOTAL ASSET BASE',
            value: `${currSymbol}${m.totalAssets.toLocaleString('en-US')}`,
            sub: `EQUITY: ${currSymbol}${m.totalEquity.toLocaleString('en-US')}`,
            badge: 'AUDITED',
            isPos: true,
          },
        ].map((kpi, idx) => (
          <div key={idx} className="hud-corner-box" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 9, fontFamily: 'Orbitron', fontWeight: 700, color: 'var(--text-muted)' }}>
                {kpi.label}
              </span>
              <span className={`badge ${kpi.isPos ? 'badge-uncommon' : 'badge-danger'}`} style={{ fontSize: 8 }}>
                {kpi.badge}
              </span>
            </div>
            <div style={{ fontFamily: 'Orbitron', fontSize: 20, fontWeight: 900, color: '#FFFFFF', marginBottom: 4 }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)' }}>
              {kpi.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Asset Composition vs Liability / Equity Structure Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        
        {/* Asset Distribution */}
        <div className="hud-corner-box hud-corner-cyan" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 800, color: '#FFFFFF' }}>
                TOTAL ASSET COMPOSITION
              </h3>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Current: {currSymbol}{m.totalCurrentAssets.toLocaleString('en-US')} · Fixed: {currSymbol}{m.totalNonCurrentAssets.toLocaleString('en-US')}
              </p>
            </div>
            <span className="badge badge-rare" style={{ fontSize: 8 }}>ASSETS</span>
          </div>

          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={assetPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={72} innerRadius={34}>
                {assetPieData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#080D1A', borderColor: 'rgba(0,240,255,0.4)', borderRadius: 4, fontFamily: 'Orbitron', fontSize: 11 }}
                formatter={(val) => [`${currSymbol}${Number(val).toLocaleString('en-US')}`, '']}
              />
              <Legend iconType="square" iconSize={7} wrapperStyle={{ fontSize: 10, fontFamily: 'Orbitron' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Liabilities & Equity */}
        <div className="hud-corner-box" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 800, color: '#FFFFFF' }}>
                LIABILITIES & EQUITY STRUCTURE
              </h3>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Liabilities: {currSymbol}{m.totalLiabilities.toLocaleString('en-US')} · Equity: {currSymbol}{m.totalEquity.toLocaleString('en-US')}
              </p>
            </div>
            <span className="badge badge-epic" style={{ fontSize: 8 }}>CAPITAL</span>
          </div>

          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={liabilityPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={72} innerRadius={34}>
                {liabilityPieData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#080D1A', borderColor: 'rgba(255,46,99,0.4)', borderRadius: 4, fontFamily: 'Orbitron', fontSize: 11 }}
                formatter={(val) => [`${currSymbol}${Number(val).toLocaleString('en-US')}`, '']}
              />
              <Legend iconType="square" iconSize={7} wrapperStyle={{ fontSize: 10, fontFamily: 'Orbitron' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* AI Working Capital Directives */}
      <div className="hud-corner-box" style={{ padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <ShieldCheck size={18} color="var(--cyber-emerald)" />
          <h3 style={{ fontFamily: 'Orbitron', fontSize: 14, fontWeight: 800, color: '#FFFFFF' }}>
            AI WORKING CAPITAL & SOLVENCY OPTIMIZATION DIRECTIVES
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
          {m.recommendations.map((rec, i) => (
            <div key={i} style={{
              background: '#060913', borderRadius: 4, padding: 16,
              border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 8
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge ${rec.priority === 'CRITICAL' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: 8 }}>
                  {rec.priority}
                </span>
                <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--cyber-emerald)', fontWeight: 700 }}>
                  {rec.expectedLift}
                </span>
              </div>
              <div style={{ fontSize: 13, fontFamily: 'Orbitron', fontWeight: 700, color: '#FFFFFF' }}>{rec.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{rec.rationale}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                {rec.steps.map((step, sIdx) => (
                  <div key={sIdx} style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <CheckCircle2 size={12} color="var(--cyber-emerald)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
