'use client';

import React from 'react';
import { useApp } from '@/lib/app-context';
import { Globe, TrendingUp, AlertTriangle, ArrowRight, Target, BarChart2, Layers, DollarSign } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function MarketSalesPage() {
  const { marketSalesReport, pnlStatement, setCurrentPage } = useApp();
  const currSymbol = pnlStatement.currency === 'INR' ? '₹' : '$';

  const totalGrossSales = marketSalesReport.reduce((a, b) => a + b.grossSales, 0);
  const totalNetSales = marketSalesReport.reduce((a, b) => a + b.netSales, 0);
  const totalTargetSales = marketSalesReport.reduce((a, b) => a + b.targetSales, 0);
  const totalGrossMargin = marketSalesReport.reduce((a, b) => a + b.grossMargin, 0);
  const avgGrossMarginPct = totalNetSales > 0 ? (totalGrossMargin / totalNetSales) * 100 : 0;
  const overallVarianceAmount = totalNetSales - totalTargetSales;
  const overallVariancePct = totalTargetSales > 0 ? (overallVarianceAmount / totalTargetSales) * 100 : 0;

  const chartData = marketSalesReport.map(m => ({
    marketName: m.marketName.length > 14 ? m.marketName.slice(0, 14) + '…' : m.marketName,
    Actual: m.netSales,
    Target: m.targetSales,
    GrossMargin: m.grossMargin,
  }));

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
            background: 'linear-gradient(135deg, #00F0FF 0%, #FF2E63 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)', flexShrink: 0,
          }}>
            <Globe size={22} color="#000003" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontFamily: 'Orbitron', fontSize: 18, fontWeight: 900, color: '#FFFFFF' }}>
                REGIONAL SALES & QUOTA VARIANCE MATRIX
              </h1>
              <span className="badge badge-rare" style={{ fontSize: 9 }}>{marketSalesReport.length} CHANNELS</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Target quota variance and margin contribution for <strong>{pnlStatement.businessName}</strong>.
            </p>
          </div>
        </div>

        <button className="btn-primary" onClick={() => setCurrentPage('ai-cofounder')}>
          AI SALES STRATEGY <ArrowRight size={12} />
        </button>
      </div>

      {/* 4 Variance Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {[
          {
            label: 'TOTAL NET SALES',
            value: `${currSymbol}${totalNetSales.toLocaleString('en-US')}`,
            sub: `${currSymbol}${totalGrossSales.toLocaleString('en-US')} GROSS SALES`,
            badge: 'AUDITED',
            isPos: true,
          },
          {
            label: 'CONSOLIDATED QUOTA',
            value: `${currSymbol}${totalTargetSales.toLocaleString('en-US')}`,
            sub: 'CONSOLIDATED TARGET',
            badge: 'TARGET',
            isPos: true,
          },
          {
            label: 'QUOTA DELTA (NET VARIANCE)',
            value: `${overallVarianceAmount >= 0 ? '+' : ''}${currSymbol}${overallVarianceAmount.toLocaleString('en-US')}`,
            sub: `${overallVariancePct >= 0 ? '+' : ''}${overallVariancePct.toFixed(1)}% VS TARGET PLAN`,
            badge: overallVarianceAmount >= 0 ? 'SURPLUS' : 'DEFICIT',
            isPos: overallVarianceAmount >= 0,
          },
          {
            label: 'BLENDED GROSS MARGIN',
            value: `${avgGrossMarginPct.toFixed(1)}%`,
            sub: `${currSymbol}${totalGrossMargin.toLocaleString('en-US')} GROSS PROFIT`,
            badge: avgGrossMarginPct >= 50 ? 'HEALTHY' : 'LOW MARGIN',
            isPos: avgGrossMarginPct >= 50,
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

      {/* Target vs Actual Comparison Chart */}
      <div className="hud-corner-box" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 800, color: '#FFFFFF' }}>
              REGIONAL SALES ATTAINMENT VS TARGET QUOTA
            </h3>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Comparison of Net Sales achieved against regional targets</p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <span className="badge badge-epic" style={{ fontSize: 8 }}>ACTUAL NET SALES</span>
            <span className="badge badge-rare" style={{ fontSize: 8 }}>TARGET QUOTA</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={chartData} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="marketName" tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'Orbitron' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `${currSymbol}${(v/1000).toFixed(0)}k`} />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={{ background: '#080D1A', borderColor: 'rgba(0,240,255,0.4)', borderRadius: 4, fontFamily: 'Orbitron', fontSize: 11 }}
              formatter={(val) => [`${currSymbol}${Number(val).toLocaleString('en-US')}`, '']}
            />
            <Bar dataKey="Actual" name="Actual Net Sales" fill="#FF2E63" radius={[2, 2, 0, 0]} maxBarSize={36} />
            <Bar dataKey="Target" name="Target Quota" fill="#00F0FF" radius={[2, 2, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Market Contribution Matrix */}
      <div className="hud-corner-box" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-hud)' }}>
          <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 800, color: '#FFFFFF' }}>
            REGIONAL MARGIN & VARIANCE CONTRIBUTION MATRIX
          </h3>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Market / Channel</th>
              <th>Gross Sales</th>
              <th>Discounts</th>
              <th>Net Sales</th>
              <th>COGS</th>
              <th>Gross Margin %</th>
              <th>Target</th>
              <th>Variance vs Target</th>
              <th>Top Category</th>
            </tr>
          </thead>
          <tbody>
            {marketSalesReport.map(row => {
              const isAheadOfTarget = row.varianceVsTargetAmount >= 0;
              return (
                <tr key={row.id}>
                  <td style={{ fontWeight: 700, color: '#FFFFFF', fontFamily: 'Orbitron', fontSize: 11 }}>{row.marketName}</td>
                  <td>{currSymbol}{row.grossSales.toLocaleString('en-US')}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{currSymbol}{row.discountsAndAllowances.toLocaleString('en-US')}</td>
                  <td style={{ fontWeight: 700, color: '#FFFFFF' }}>{currSymbol}{row.netSales.toLocaleString('en-US')}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{currSymbol}{row.costOfGoodsSold.toLocaleString('en-US')}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div className="progress-bar" style={{ width: 45 }}>
                        <div className="progress-fill" style={{ width: `${row.grossMarginPercent}%` }} />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 11, fontFamily: 'Orbitron', color: 'var(--cyber-emerald)' }}>
                        {row.grossMarginPercent}%
                      </span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{currSymbol}{row.targetSales.toLocaleString('en-US')}</td>
                  <td>
                    <span style={{
                      fontWeight: 800, fontSize: 11, fontFamily: 'JetBrains Mono',
                      color: isAheadOfTarget ? 'var(--cyber-emerald)' : 'var(--cyber-red)',
                    }}>
                      {isAheadOfTarget ? '+' : ''}{currSymbol}{row.varianceVsTargetAmount.toLocaleString('en-US')} ({isAheadOfTarget ? '+' : ''}{row.varianceVsTargetPercent.toFixed(1)}%)
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-rare" style={{ fontSize: 9 }}>{row.topProductCategory}</span>
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
