'use client';

import React from 'react';
import { useApp } from '@/lib/app-context';
import {
  TrendingUp, TrendingDown, DollarSign, Percent, PieChart,
  ArrowRight, Target, Zap, AlertTriangle, CheckCircle2,
  Shield, Award, Sparkles, Terminal, Activity
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, PieChart as RechartsPie, Pie, Cell, Legend
} from 'recharts';

export default function DashboardPage() {
  const { pnlStatement, metrics, balanceSheetMetrics, cohortMetrics, marketSalesReport, setCurrentPage, setIsReportModalOpen } = useApp();
  const { revenue, costOfGoodsSold, expenses, reportingPeriod, businessName, currency } = pnlStatement;
  const currSymbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

  const [chartMetric, setChartMetric] = React.useState<'both' | 'revenue' | 'profit'>('both');

  const formatCompact = (v: number) => {
    const abs = Math.abs(v);
    const sign = v < 0 ? '-' : '';
    if (abs >= 10000000) return `${sign}${currSymbol}${(abs / 10000000).toFixed(1)}Cr`;
    if (abs >= 100000) return `${sign}${currSymbol}${(abs / 100000).toFixed(1)}L`;
    if (abs >= 1000) return `${sign}${currSymbol}${(abs / 1000).toFixed(0)}k`;
    return `${sign}${currSymbol}${abs}`;
  };

  const hasPrevPeriod = pnlStatement.previousPeriodRevenue != null && pnlStatement.previousPeriodRevenue > 0;
  
  const periodCompData = hasPrevPeriod
    ? (chartMetric === 'revenue'
        ? [
            { label: 'PREV REV', value: pnlStatement.previousPeriodRevenue, fill: '#334155' },
            { label: 'CURR REV', value: revenue, fill: '#00F0FF' },
          ]
        : chartMetric === 'profit'
        ? [
            { label: 'PREV NET', value: pnlStatement.previousPeriodNetProfit ?? 0, fill: '#334155' },
            { label: 'CURR NET', value: metrics.netProfit, fill: metrics.netProfit >= 0 ? '#00FF88' : '#FF2E63' },
          ]
        : [
            { label: 'PREV REV', value: pnlStatement.previousPeriodRevenue, fill: '#334155' },
            { label: 'CURR REV', value: revenue, fill: '#00F0FF' },
            { label: 'PREV NET', value: pnlStatement.previousPeriodNetProfit ?? 0, fill: '#64748B' },
            { label: 'CURR NET', value: metrics.netProfit, fill: metrics.netProfit >= 0 ? '#00FF88' : '#FF2E63' },
          ]
      )
    : [
        { label: 'REVENUE', value: revenue, fill: '#00F0FF' },
        { label: 'COGS', value: costOfGoodsSold, fill: '#FF2E63' },
        { label: 'OPEX', value: metrics.totalOperatingExpenses, fill: '#FFB800' },
        { label: 'NET PROFIT', value: metrics.netProfit, fill: metrics.netProfit >= 0 ? '#00FF88' : '#FF2E63' },
      ];

  const expenseData = [
    { name: 'COGS', value: costOfGoodsSold, fill: '#FF2E63' },
    { name: 'Payroll', value: expenses.employeeExpenses, fill: '#9945FF' },
    { name: 'Marketing', value: expenses.marketingExpenses, fill: '#00F0FF' },
    { name: 'Rent', value: expenses.rentAndUtilities, fill: '#FFB800' },
    { name: 'Depreciation', value: expenses.depreciation, fill: '#8B5CF6' },
    { name: 'Interest', value: expenses.interestExpenses, fill: '#EC4899' },
    { name: 'Taxes', value: expenses.taxes, fill: '#00FF88' },
    { name: 'Other', value: expenses.otherExpenses, fill: '#64748B' },
  ].filter(d => d.value > 0);

  const kpis = [
    {
      label: 'GROSS REVENUE',
      value: `${currSymbol}${revenue.toLocaleString('en-US')}`,
      sub: `${metrics.revenueGrowthPercent >= 0 ? '+' : ''}${metrics.revenueGrowthPercent.toFixed(1)}% PERIOD DELTA`,
      isPos: metrics.revenueGrowthPercent >= 0,
      icon: DollarSign,
      color: '#00F0FF',
      badge: 'TIER 1',
    },
    {
      label: 'GROSS PROFIT',
      value: `${currSymbol}${metrics.grossProfit.toLocaleString('en-US')}`,
      sub: `${metrics.grossMarginPercent.toFixed(1)}% MARGIN RATIO`,
      isPos: metrics.grossMarginPercent >= 50,
      icon: TrendingUp,
      color: '#FF2E63',
      badge: metrics.grossMarginPercent >= 60 ? 'EPIC' : 'RARE',
    },
    {
      label: 'NET PROFIT / LOSS',
      value: `${currSymbol}${metrics.netProfit.toLocaleString('en-US')}`,
      sub: `${metrics.netMarginPercent.toFixed(1)}% NET MARGIN`,
      isPos: metrics.netProfit >= 0,
      icon: metrics.netProfit >= 0 ? TrendingUp : TrendingDown,
      color: metrics.netProfit >= 0 ? '#00FF88' : '#FF2E63',
      badge: metrics.netProfit >= 0 ? 'LEGENDARY' : 'CRITICAL',
    },
    {
      label: 'OPERATING EXPENSES',
      value: `${currSymbol}${metrics.totalOperatingExpenses.toLocaleString('en-US')}`,
      sub: `${metrics.expenseRatioPercent.toFixed(1)}% EXPENSE RATIO`,
      isPos: metrics.expenseRatioPercent < 60,
      icon: Percent,
      color: '#FFB800',
      badge: 'AUDITED',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      
      {/* Hero Banner with Active Quest Widget */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.6fr 1fr',
        gap: 16,
      }}>
        
        {/* Left: Enterprise Status HUD */}
        <div className="hud-corner-box" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span className="badge badge-epic">ENTERPRISE SYSTEM</span>
              <span className="badge badge-rare">{reportingPeriod}</span>
              <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--cyber-emerald)' }}>
                ● 100% RECONCILED
              </span>
            </div>
            
            <h1 style={{ fontFamily: 'Orbitron', fontSize: 22, fontWeight: 900, color: '#FFFFFF', marginBottom: 6 }}>
              {businessName}
            </h1>
            
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {metrics.plainLanguageExplanation}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button className="btn-primary" onClick={() => setCurrentPage('ai-cofounder')}>
              EXECUTE AI ACTION SPRINT <ArrowRight size={12} />
            </button>
            <button className="btn-secondary" onClick={() => setIsReportModalOpen(true)}>
              UPDATE P&L STATEMENT
            </button>
          </div>
        </div>

        {/* Right: Active Quest HUD Box */}
        <div className="hud-corner-box hud-corner-cyan" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-cyan)', paddingBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Target size={14} color="var(--cyber-cyan)" />
              <span style={{ fontFamily: 'Orbitron', fontSize: 11, fontWeight: 800, color: 'var(--cyber-cyan)' }}>
                ACTIVE STRATEGIC QUEST
              </span>
            </div>
            <span className="badge badge-legendary" style={{ fontSize: 8 }}>PRIMARY MISSION</span>
          </div>

          <div>
            <div style={{ fontSize: 10, color: 'var(--cyber-red)', fontFamily: 'Orbitron', fontWeight: 700, marginTop: 2 }}>
              QUEST OBJECTIVE
            </div>
            <div style={{ fontSize: 13, fontFamily: 'Orbitron', fontWeight: 800, color: '#FFFFFF' }}>
              OPEX COMPRESSION & MARGIN LIFT
            </div>
          </div>

          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Trim operating expenses by 8% to recover <strong style={{ color: 'var(--cyber-emerald)' }}>+{currSymbol}{Math.round(metrics.totalOperatingExpenses * 0.08).toLocaleString('en-US')}</strong> in liquid net profit.
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <span className="badge badge-uncommon" style={{ fontSize: 9 }}>+15 SOLVENCY XP</span>
              <span className="badge badge-rare" style={{ fontSize: 9 }}>+25 MARGIN</span>
            </div>
            <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--cyber-cyan)', fontWeight: 700 }}>
              IN PROGRESS
            </span>
          </div>
        </div>

      </div>

      {/* 4 Core Financial KPI HUD Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="hud-corner-box" style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'Orbitron', fontWeight: 700 }}>
                  {kpi.label}
                </span>
                <span className={kpi.badge === 'LEGENDARY' ? 'badge-legendary' : kpi.badge === 'EPIC' ? 'badge-epic' : 'badge-rare'} style={{ fontSize: 8 }}>
                  {kpi.badge}
                </span>
              </div>

              <div style={{ fontFamily: 'Orbitron', fontSize: 20, fontWeight: 900, color: '#FFFFFF', marginBottom: 4 }}>
                {kpi.value}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className={`badge ${kpi.isPos ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 9 }}>
                  {kpi.sub}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        
        {/* Period Comparison Bar Chart */}
        <div className="hud-corner-box" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 800, color: '#FFFFFF' }}>
                {hasPrevPeriod ? 'PERIOD COMPARISON // REVENUE & NET PROFIT' : 'FINANCIAL BREAKDOWN // SINGLE PERIOD'}
              </h3>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {hasPrevPeriod ? `Comparison against prior reported period in ${currency}` : `Key financial metrics for current period in ${currency}`}
              </p>
            </div>
            {hasPrevPeriod && (
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => setChartMetric('both')}
                  style={{
                    cursor: 'pointer',
                    fontSize: 8,
                    fontFamily: 'Orbitron',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 3,
                    background: chartMetric === 'both' ? 'rgba(0, 240, 255, 0.25)' : 'rgba(255,255,255,0.05)',
                    border: chartMetric === 'both' ? '1px solid var(--cyber-cyan)' : '1px solid var(--border-subtle)',
                    color: chartMetric === 'both' ? '#FFFFFF' : 'var(--text-muted)',
                  }}
                >
                  ALL
                </button>
                <button
                  onClick={() => setChartMetric('revenue')}
                  style={{
                    cursor: 'pointer',
                    fontSize: 8,
                    fontFamily: 'Orbitron',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 3,
                    background: chartMetric === 'revenue' ? 'rgba(0, 240, 255, 0.25)' : 'rgba(255,255,255,0.05)',
                    border: chartMetric === 'revenue' ? '1px solid var(--cyber-cyan)' : '1px solid var(--border-subtle)',
                    color: chartMetric === 'revenue' ? '#FFFFFF' : 'var(--text-muted)',
                  }}
                >
                  REVENUE
                </button>
                <button
                  onClick={() => setChartMetric('profit')}
                  style={{
                    cursor: 'pointer',
                    fontSize: 8,
                    fontFamily: 'Orbitron',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 3,
                    background: chartMetric === 'profit' ? 'rgba(0, 255, 136, 0.25)' : 'rgba(255,255,255,0.05)',
                    border: chartMetric === 'profit' ? '1px solid var(--cyber-emerald)' : '1px solid var(--border-subtle)',
                    color: chartMetric === 'profit' ? '#FFFFFF' : 'var(--text-muted)',
                  }}
                >
                  NET PROFIT
                </button>
              </div>
            )}
          </div>

          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={periodCompData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'Orbitron' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={formatCompact} />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{ background: '#080D1A', borderColor: 'rgba(0,240,255,0.4)', borderRadius: 4, fontFamily: 'Orbitron', fontSize: 11 }}
                formatter={(val) => [`${currSymbol}${Number(val).toLocaleString('en-US')}`, '']}
              />
              <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={45}>
                {periodCompData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Composition Chart */}
        <div className="hud-corner-box hud-corner-cyan" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 800, color: '#FFFFFF' }}>
                EXPENSE BREAKDOWN // OPEX + COGS
              </h3>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Distribution of cost categories</p>
            </div>
            <span className="badge badge-epic" style={{ fontSize: 8 }}>COST RATIO</span>
          </div>

          <ResponsiveContainer width="100%" height={210}>
            <RechartsPie>
              <Pie data={expenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={72} innerRadius={34}>
                {expenseData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#080D1A', borderColor: 'rgba(255,46,99,0.4)', borderRadius: 4, fontFamily: 'Orbitron', fontSize: 11 }}
                formatter={(val) => [`${currSymbol}${Number(val).toLocaleString('en-US')}`, '']}
              />
              <Legend iconType="square" iconSize={7} wrapperStyle={{ fontSize: 10, fontFamily: 'Orbitron' }} />
            </RechartsPie>
          </ResponsiveContainer>
        </div>

      </div>

      {/* 3 Cross-Module Intelligence HUD Cards — Clean without numbers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
        {[
          {
            page: 'balance-sheet' as const,
            title: 'BALANCE SHEET & SOLVENCY',
            detail: `Current Ratio: ${balanceSheetMetrics.currentRatio.toFixed(2)}x · Working Capital: ${currSymbol}${balanceSheetMetrics.workingCapital.toLocaleString('en-US')}`,
            badge: `${balanceSheetMetrics.solvencyScore}/100 SOLVENCY`,
            badgeType: 'badge-uncommon',
          },
          {
            page: 'market-sales' as const,
            title: 'REGIONAL SALES VARIANCE',
            detail: 'Regional sales quotas, allowances, and gross contribution margin by market',
            badge: `${marketSalesReport.length} DISTRIBUTION CHANNELS`,
            badgeType: 'badge-rare',
          },
          {
            page: 'cohort-analysis' as const,
            title: 'SAAS COHORT RETENTION',
            detail: `NRR: ${cohortMetrics.netRevenueRetentionPercent}% · LTV:CAC: ${cohortMetrics.ltvToCacRatio}x · Payback: ${cohortMetrics.cacPaybackMonths}mo`,
            badge: cohortMetrics.cohortHealthStatus.toUpperCase(),
            badgeType: 'badge-legendary',
          },
        ].map(mod => (
          <div
            key={mod.page}
            className="hud-corner-box"
            onClick={() => setCurrentPage(mod.page)}
            style={{ padding: '16px 18px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'Orbitron', fontSize: 12, fontWeight: 800, color: '#FFFFFF' }}>{mod.title}</h3>
              <span className={`badge ${mod.badgeType}`} style={{ fontSize: 8 }}>{mod.badge}</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{mod.detail}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontFamily: 'Orbitron', color: 'var(--cyber-cyan)', marginTop: 4 }}>
              OPEN MODULE [VIEW] <ArrowRight size={11} />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
