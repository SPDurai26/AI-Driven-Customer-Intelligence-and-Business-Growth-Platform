'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/app-context';
import {
  Target, TrendingUp, Sparkles, ArrowRight, DollarSign,
  Percent, Sliders, ShieldCheck, CheckCircle2, RefreshCw
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

export default function GrowthPage() {
  const { pnlStatement, metrics, setCurrentPage } = useApp();
  const currSymbol = pnlStatement.currency === 'INR' ? '₹' : '$';

  const [revenueDeltaPct, setRevenueDeltaPct] = useState<number>(0);
  const [cogsDeltaPct, setCogsDeltaPct] = useState<number>(0);
  const [opexDeltaPct, setOpexDeltaPct] = useState<number>(0);

  const simRevenue = Math.round(pnlStatement.revenue * (1 + revenueDeltaPct / 100));
  const simCogs = Math.round(pnlStatement.costOfGoodsSold * (1 + cogsDeltaPct / 100));
  const simGrossProfit = simRevenue - simCogs;
  const simGrossMarginPct = simRevenue > 0 ? (simGrossProfit / simRevenue) * 100 : 0;

  const simOpex = Math.round(metrics.totalOperatingExpenses * (1 + opexDeltaPct / 100));
  const simNetProfit = simGrossProfit - simOpex;
  const simNetMarginPct = simRevenue > 0 ? (simNetProfit / simRevenue) * 100 : 0;

  // Break-even uses fixedCosts (not total opex). Scale fixed costs by the opex delta slider.
  const simFixedCosts = Math.round(pnlStatement.fixedCosts * (1 + opexDeltaPct / 100));
  const simContributionMarginRatio = simRevenue > 0 ? (simRevenue - simCogs) / simRevenue : 0;
  const simBreakEvenSales = simContributionMarginRatio > 0 ? Math.round(simFixedCosts / simContributionMarginRatio) : 0;

  const growthTargets = [
    {
      tier: 'CONSERVATIVE (+10%)',
      targetRevenue: Math.round(pnlStatement.revenue * 1.10),
      targetNetProfit: Math.round(metrics.netProfit * 1.18),
      timeframe: '60 DAYS',
      badge: 'badge-rare',
      actions: 'Reduce discretionary OpEx by 5% and upsell 10 existing customer accounts.',
    },
    {
      tier: 'BALANCED GROWTH (+25%)',
      targetRevenue: Math.round(pnlStatement.revenue * 1.25),
      targetNetProfit: Math.round(metrics.netProfit * 1.45),
      timeframe: '180 DAYS',
      badge: 'badge-legendary',
      actions: 'Renegotiate supplier COGS by 8%, launch annual contract incentives to protect NRR.',
    },
    {
      tier: 'AGGRESSIVE SCALE (+50%)',
      targetRevenue: Math.round(pnlStatement.revenue * 1.50),
      targetNetProfit: Math.round(metrics.netProfit * 2.10),
      timeframe: '12 MONTHS',
      badge: 'badge-epic',
      actions: 'Expand into top-performing regional distribution channel and automate billing.',
    },
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
            background: 'linear-gradient(135deg, #FFB800 0%, #FF2E63 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 15px rgba(255, 184, 0, 0.4)', flexShrink: 0,
          }}>
            <Target size={22} color="#000003" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontFamily: 'Orbitron', fontSize: 18, fontWeight: 900, color: '#FFFFFF' }}>
                BREAK-EVEN & WHAT-IF SCENARIO MODELING
              </h1>
              <span className="badge badge-legendary" style={{ fontSize: 9 }}>SIMULATOR ENGINE</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Interactive what-if simulations and growth targets grounded in <strong>{pnlStatement.businessName}</strong> financial reports.
            </p>
          </div>
        </div>

        <button className="btn-primary" onClick={() => setCurrentPage('ai-cofounder')}>
          AI GROWTH SPRINT <ArrowRight size={12} />
        </button>
      </div>

      {/* Break-Even KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {[
          {
            label: 'BREAK-EVEN SALES THRESHOLD',
            value: `${currSymbol}${Math.round(metrics.breakEvenSales).toLocaleString('en-US')}`,
            sub: `FIXED & VARIABLE COST COVERAGE`,
            badge: 'AUDITED',
            isPos: true,
          },
          {
            label: 'SAFETY MARGIN BUFFER',
            value: `${metrics.breakEvenSafetyMarginPercent.toFixed(1)}%`,
            sub: `${currSymbol}${Math.round(pnlStatement.revenue - metrics.breakEvenSales).toLocaleString('en-US')} ABOVE THRESHOLD`,
            badge: metrics.breakEvenSafetyMarginPercent >= 15 ? 'OPTIMAL' : 'WATCH',
            isPos: metrics.breakEvenSafetyMarginPercent >= 15,
          },
          {
            label: 'CONTRIBUTION MARGIN',
            value: `${metrics.grossMarginPercent.toFixed(1)}%`,
            sub: `${currSymbol}${(metrics.grossProfit).toLocaleString('en-US')} GROSS CONTRIBUTION`,
            badge: 'MARGIN',
            isPos: true,
          },
          {
            label: 'NET MARGIN %',
            value: `${metrics.netMarginPercent.toFixed(1)}%`,
            sub: `${currSymbol}${metrics.netProfit.toLocaleString('en-US')} NET PROFIT`,
            badge: metrics.netProfit >= 0 ? 'PROFITABLE' : 'LOSS',
            isPos: metrics.netProfit >= 0,
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

      {/* Interactive Scenario Simulator */}
      <div className="hud-corner-box hud-corner-cyan" style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sliders size={18} color="var(--cyber-cyan)" />
            <div>
              <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 800, color: '#FFFFFF' }}>
                INTERACTIVE SCENARIO SIMULATOR // WHAT-IF ENGINE
              </h3>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Adjust revenue, COGS, and OpEx levers to project shifted profit and break-even outcomes.</p>
            </div>
          </div>
          <button
            className="btn-ghost"
            onClick={() => { setRevenueDeltaPct(0); setCogsDeltaPct(0); setOpexDeltaPct(0); }}
            style={{ fontSize: 10, fontFamily: 'Orbitron' }}
          >
            <RefreshCw size={11} /> RESET SLIDERS
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, alignItems: 'center' }}>
          
          {/* Sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontFamily: 'Orbitron', fontWeight: 700, color: '#FFFFFF' }}>REVENUE / PRICING SHIFT</span>
                <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', fontWeight: 700, color: revenueDeltaPct >= 0 ? 'var(--cyber-emerald)' : 'var(--cyber-red)' }}>
                  {revenueDeltaPct >= 0 ? '+' : ''}{revenueDeltaPct}% → {currSymbol}{simRevenue.toLocaleString('en-US')}
                </span>
              </div>
              <input
                type="range"
                min="-30"
                max="50"
                step="1"
                value={revenueDeltaPct}
                onChange={e => setRevenueDeltaPct(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--cyber-cyan)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontFamily: 'Orbitron', fontWeight: 700, color: '#FFFFFF' }}>COGS / SUPPLIER COST SHIFT</span>
                <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', fontWeight: 700, color: cogsDeltaPct <= 0 ? 'var(--cyber-emerald)' : 'var(--cyber-red)' }}>
                  {cogsDeltaPct >= 0 ? '+' : ''}{cogsDeltaPct}% → {currSymbol}{simCogs.toLocaleString('en-US')}
                </span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                step="1"
                value={cogsDeltaPct}
                onChange={e => setCogsDeltaPct(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--cyber-red)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontFamily: 'Orbitron', fontWeight: 700, color: '#FFFFFF' }}>OPERATING EXPENSES SHIFT</span>
                <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', fontWeight: 700, color: opexDeltaPct <= 0 ? 'var(--cyber-emerald)' : 'var(--cyber-red)' }}>
                  {opexDeltaPct >= 0 ? '+' : ''}{opexDeltaPct}% → {currSymbol}{simOpex.toLocaleString('en-US')}
                </span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                step="1"
                value={opexDeltaPct}
                onChange={e => setOpexDeltaPct(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--cyber-gold)' }}
              />
            </div>
          </div>

          {/* Outcome Summary Box */}
          <div style={{ background: '#060913', borderRadius: 4, padding: 18, border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontSize: 10, fontFamily: 'Orbitron', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--cyber-cyan)' }}>
              PROJECTED SIMULATED OUTCOMES
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <span style={{ fontSize: 9, color: 'var(--text-muted)', display: 'block', fontFamily: 'Orbitron' }}>SIMULATED NET PROFIT</span>
                <span style={{ fontFamily: 'Orbitron', fontSize: 18, fontWeight: 900, color: simNetProfit >= 0 ? 'var(--cyber-emerald)' : 'var(--cyber-red)' }}>
                  {simNetProfit < 0 ? '-' : ''}{currSymbol}{Math.abs(simNetProfit).toLocaleString('en-US')}
                </span>
              </div>
              <div>
                <span style={{ fontSize: 9, color: 'var(--text-muted)', display: 'block', fontFamily: 'Orbitron' }}>SIMULATED NET MARGIN</span>
                <span style={{ fontFamily: 'Orbitron', fontSize: 18, fontWeight: 900, color: simNetMarginPct >= 10 ? 'var(--cyber-emerald)' : 'var(--cyber-gold)' }}>
                  {simNetMarginPct.toFixed(1)}%
                </span>
              </div>
              <div>
                <span style={{ fontSize: 9, color: 'var(--text-muted)', display: 'block', fontFamily: 'Orbitron' }}>SIMULATED GROSS MARGIN</span>
                <span style={{ fontFamily: 'Orbitron', fontSize: 15, fontWeight: 800, color: '#FFFFFF' }}>
                  {simGrossMarginPct.toFixed(1)}%
                </span>
              </div>
              <div>
                <span style={{ fontSize: 9, color: 'var(--text-muted)', display: 'block', fontFamily: 'Orbitron' }}>SIMULATED BREAK-EVEN</span>
                <span style={{ fontFamily: 'Orbitron', fontSize: 15, fontWeight: 800, color: '#FFFFFF' }}>
                  {currSymbol}{simBreakEvenSales.toLocaleString('en-US')}
                </span>
              </div>
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)', paddingTop: 8, marginTop: 4 }}>
              Profit Impact: <strong style={{ color: 'var(--cyber-emerald)' }}>{simNetProfit - metrics.netProfit >= 0 ? '+' : ''}{currSymbol}{(simNetProfit - metrics.netProfit).toLocaleString('en-US')}</strong> vs current baseline.
            </div>
          </div>

        </div>
      </div>

      {/* Structured Growth Targets */}
      <div className="hud-corner-box" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <TrendingUp size={18} color="var(--cyber-emerald)" />
          <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 800, color: '#FFFFFF' }}>
            STRUCTURED GROWTH SCALE TARGETS
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          {growthTargets.map((gt, idx) => (
            <div key={idx} style={{ background: '#060913', borderRadius: 4, padding: 14, border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge ${gt.badge}`} style={{ fontSize: 8 }}>{gt.tier}</span>
                <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>⏱ {gt.timeframe}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <span style={{ fontSize: 9, fontFamily: 'Orbitron', color: 'var(--text-muted)', display: 'block' }}>TARGET REVENUE</span>
                  <span style={{ fontFamily: 'Orbitron', fontSize: 16, fontWeight: 900, color: '#FFFFFF' }}>
                    {currSymbol}{gt.targetRevenue.toLocaleString('en-US')}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 9, fontFamily: 'Orbitron', color: 'var(--text-muted)', display: 'block' }}>TARGET NET PROFIT</span>
                  <span style={{ fontFamily: 'Orbitron', fontSize: 16, fontWeight: 900, color: 'var(--cyber-emerald)' }}>
                    {currSymbol}{gt.targetNetProfit.toLocaleString('en-US')}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {gt.actions}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
