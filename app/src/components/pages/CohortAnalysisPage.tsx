'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/app-context';
import {
  Users, TrendingUp, Sparkles, AlertTriangle, ArrowRight,
  ShieldCheck, CheckCircle2, Layers, DollarSign, Calendar
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function CohortAnalysisPage() {
  const { cohortDataset, cohortMetrics, pnlStatement, setCurrentPage } = useApp();
  const currSymbol = pnlStatement.currency === 'INR' ? '₹' : '$';
  const cm = cohortMetrics;
  const [viewMode, setViewMode] = useState<'customer' | 'revenue'>('customer');

  const getHeatmapColor = (pct: number) => {
    if (pct >= 90) return 'rgba(0, 255, 136, 0.4)';  // Neon Emerald
    if (pct >= 80) return 'rgba(0, 255, 136, 0.2)';
    if (pct >= 70) return 'rgba(0, 240, 255, 0.25)'; // Neon Cyan
    if (pct >= 60) return 'rgba(255, 184, 0, 0.25)'; // Neon Gold
    if (pct >= 50) return 'rgba(255, 115, 0, 0.25)'; // Orange
    return 'rgba(255, 46, 99, 0.3)';                  // Neon Crimson
  };

  const monthsHeader = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11'];

  const cohortColors = [
    '#FF2E63', '#FF007F', '#9945FF', '#8B5CF6', '#00F0FF',
    '#00FF88', '#34D399', '#FFB800', '#FBBF24', '#E50914'
  ];

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
            background: 'linear-gradient(135deg, #9945FF 0%, #00F0FF 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 15px rgba(153, 69, 255, 0.4)', flexShrink: 0,
          }}>
            <Users size={22} color="#000003" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontFamily: 'Orbitron', fontSize: 18, fontWeight: 900, color: '#FFFFFF' }}>
                CUSTOMER COHORT & NET RETENTION ENGINE
              </h1>
              <span className="badge badge-legendary" style={{ fontSize: 9 }}>
                {cm.cohortHealthStatus.toUpperCase()}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {cm.plainLanguageSummary}
            </p>
          </div>
        </div>

        <button className="btn-primary" onClick={() => setCurrentPage('ai-cofounder')}>
          AI RETENTION SPRINT <ArrowRight size={12} />
        </button>
      </div>

      {/* 5 Core Cohort KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {[
          {
            label: 'NET REVENUE RETENTION (NRR)',
            value: `${cm.netRevenueRetentionPercent}%`,
            sub: 'EXPANSION EXCEEDS CHURN',
            badge: cm.netRevenueRetentionPercent >= 100 ? 'LEGENDARY' : 'CRITICAL',
            isPos: cm.netRevenueRetentionPercent >= 100,
          },
          {
            label: 'GROSS RETENTION (GRR)',
            value: `${cm.grossRevenueRetentionPercent}%`,
            sub: 'EXCLUDES UPSELLS',
            badge: 'AUDITED',
            isPos: cm.grossRevenueRetentionPercent >= 85,
          },
          {
            label: 'UNIT ECONOMICS (LTV:CAC)',
            value: `${cm.ltvToCacRatio}x`,
            sub: `CAC: ${currSymbol}${cohortDataset.averageCustomerAcquisitionCost.toLocaleString()} · LTV: ${currSymbol}${cohortDataset.averageCustomerLifetimeValue.toLocaleString()}`,
            badge: cm.ltvToCacRatio >= 3.0 ? 'OPTIMAL' : 'WATCH',
            isPos: cm.ltvToCacRatio >= 3.0,
          },
          {
            label: 'CAC PAYBACK PERIOD',
            value: `${cm.cacPaybackMonths} MO`,
            sub: 'TIME TO RECOVER CAC',
            badge: cm.cacPaybackMonths <= 6 ? 'FAST' : 'SLOW',
            isPos: cm.cacPaybackMonths <= 6,
          },
          {
            label: '12-MONTH RETENTION',
            value: `${cm.averageMonth12Retention}%`,
            sub: `INITIAL 30-DAY: ${cm.averageMonth1Retention}%`,
            badge: 'ANNUAL VINTAGE',
            isPos: cm.averageMonth12Retention >= 65,
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

      {/* Cohort Layer Cake Chart */}
      <div className="hud-corner-box hud-corner-cyan" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 800, color: '#FFFFFF' }}>
              COHORT LAYER CAKE // COMPOUNDING RECURRING REVENUE
            </h3>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Stacked monthly revenue vintage demonstrating retention stability + expansion
            </p>
          </div>
          <span className="badge badge-rare" style={{ fontSize: 8 }}>COMPOUNDING ARR</span>
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={cm.layerCakeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="monthName" tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'Orbitron' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `${currSymbol}${(v/1000).toFixed(0)}k`} />
            <Tooltip
              cursor={{ stroke: 'rgba(0, 240, 255, 0.3)', strokeWidth: 1 }}
              contentStyle={{ background: '#080D1A', borderColor: 'rgba(0,240,255,0.4)', borderRadius: 4, fontFamily: 'Orbitron', fontSize: 11 }}
              formatter={(val) => [`${currSymbol}${Number(val).toLocaleString('en-US')}`, '']}
            />
            {cohortDataset.cohorts.map((c, i) => (
              <Area
                key={c.cohortName}
                type="monotone"
                dataKey={c.cohortName}
                stackId="1"
                stroke={cohortColors[i % cohortColors.length]}
                fill={cohortColors[i % cohortColors.length]}
                opacity={0.8}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Cohort Retention Heatmap Matrix */}
      <div className="hud-corner-box" style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid var(--border-hud)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 800, color: '#FFFFFF' }}>
              COHORT RETENTION MATRIX HEATMAP
            </h3>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Active account and net revenue retention tracking across subsequent months
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setViewMode('customer')}
              className={`btn-secondary ${viewMode === 'customer' ? 'active' : ''}`}
              style={{
                fontSize: 10, padding: '4px 8px',
                background: viewMode === 'customer' ? 'rgba(255, 46, 99, 0.2)' : 'transparent',
                borderColor: viewMode === 'customer' ? 'var(--cyber-red)' : 'var(--border-subtle)',
                color: viewMode === 'customer' ? '#FFFFFF' : 'var(--text-muted)',
              }}
            >
              ACCOUNT %
            </button>
            <button
              onClick={() => setViewMode('revenue')}
              className={`btn-secondary ${viewMode === 'revenue' ? 'active' : ''}`}
              style={{
                fontSize: 10, padding: '4px 8px',
                background: viewMode === 'revenue' ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
                borderColor: viewMode === 'revenue' ? 'var(--cyber-cyan)' : 'var(--border-subtle)',
                color: viewMode === 'revenue' ? '#FFFFFF' : 'var(--text-muted)',
              }}
            >
              REVENUE (NRR) %
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: 100 }}>Cohort</th>
                <th>Users</th>
                <th>MRR</th>
                {monthsHeader.map(m => (
                  <th key={m} style={{ textAlign: 'center', minWidth: 46 }}>{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cohortDataset.cohorts.map(c => {
                const values = viewMode === 'customer' ? c.retentionByMonth : c.revenueRetentionByMonth;
                return (
                  <tr key={c.cohortName}>
                    <td style={{ fontWeight: 700, color: '#FFFFFF', fontFamily: 'Orbitron', fontSize: 11 }}>{c.cohortName}</td>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>{c.acquiredCustomers}</td>
                    <td style={{ fontWeight: 700, fontFamily: 'JetBrains Mono' }}>{currSymbol}{c.initialMrr.toLocaleString('en-US')}</td>
                    {monthsHeader.map((m, idx) => {
                      const val = values[idx];
                      if (val === undefined) {
                        return <td key={m} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>—</td>;
                      }
                      return (
                        <td
                          key={m}
                          style={{
                            textAlign: 'center',
                            background: getHeatmapColor(val),
                            fontWeight: 700,
                            fontSize: 10,
                            fontFamily: 'JetBrains Mono',
                            color: '#FFFFFF',
                            padding: '6px 4px',
                            border: '1px solid rgba(0,0,0,0.4)',
                          }}
                        >
                          {val}%
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
