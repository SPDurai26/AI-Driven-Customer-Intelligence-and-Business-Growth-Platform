'use client';

import React from 'react';
import { useApp } from '@/lib/app-context';
import {
  Trophy, Award, Zap, CheckCircle2, Lock, Sparkles,
  TrendingUp, ShieldCheck, Flame, Star, Target, Layers
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  category: 'Profitability' | 'Liquidity' | 'Growth' | 'Retention';
  tier: 'Legendary' | 'Epic' | 'Rare' | 'Uncommon';
  description: string;
  requirementText: string;
  xpValue: number;
  unlocked: boolean;
  progressPercent: number;
}

export default function AchievementsPage() {
  const { pnlStatement, metrics, balanceSheetMetrics, cohortMetrics, marketSalesReport } = useApp();
  const currSymbol = pnlStatement.currency === 'INR' ? '₹' : '$';

  const achievements: Achievement[] = [
    {
      id: 'ach-margin-titan',
      title: 'Gross Margin Titan',
      category: 'Profitability',
      tier: 'Legendary',
      description: 'Maintain healthy unit economics and supplier pricing leverage.',
      requirementText: 'Gross Margin ≥ 50.0%',
      xpValue: 500,
      unlocked: metrics.grossMarginPercent >= 50,
      progressPercent: Math.min(100, Math.round((metrics.grossMarginPercent / 50) * 100)),
    },
    {
      id: 'ach-net-profit',
      title: 'Net Profit Master',
      category: 'Profitability',
      tier: 'Epic',
      description: 'Translate top-line volume into strong bottom-line free cash flow.',
      requirementText: 'Net Margin ≥ 15.0%',
      xpValue: 400,
      unlocked: metrics.netMarginPercent >= 15,
      progressPercent: Math.min(100, Math.round((metrics.netMarginPercent / 15) * 100)),
    },
    {
      id: 'ach-solvency',
      title: 'Solvency Guardian',
      category: 'Liquidity',
      tier: 'Epic',
      description: 'Maintain liquid asset reserves well in excess of short-term obligations.',
      requirementText: 'Current Ratio ≥ 1.50x',
      xpValue: 350,
      unlocked: balanceSheetMetrics.currentRatio >= 1.5,
      progressPercent: Math.min(100, Math.round((balanceSheetMetrics.currentRatio / 1.5) * 100)),
    },
    {
      id: 'ach-quick-liquid',
      title: 'Acid-Test Fortress',
      category: 'Liquidity',
      tier: 'Rare',
      description: 'Quick ratio exceeds 1.0x ensuring instant debt coverage.',
      requirementText: 'Quick Ratio ≥ 1.00x',
      xpValue: 250,
      unlocked: balanceSheetMetrics.quickRatio >= 1.0,
      progressPercent: Math.min(100, Math.round((balanceSheetMetrics.quickRatio / 1.0) * 100)),
    },
    {
      id: 'ach-nrr-dynamo',
      title: 'Retention Dynamo',
      category: 'Retention',
      tier: 'Legendary',
      description: 'Net Revenue Retention over 100% means existing cohorts expand naturally.',
      requirementText: 'NRR ≥ 100.0%',
      xpValue: 600,
      unlocked: cohortMetrics.netRevenueRetentionPercent >= 100,
      progressPercent: Math.min(100, Math.round((cohortMetrics.netRevenueRetentionPercent / 100) * 100)),
    },
    {
      id: 'ach-cac-speed',
      title: 'Capital Velocity Sprint',
      category: 'Retention',
      tier: 'Rare',
      description: 'Rapid payback of customer acquisition costs into reusable cash.',
      requirementText: 'CAC Payback ≤ 6 Months',
      xpValue: 300,
      unlocked: cohortMetrics.cacPaybackMonths <= 6,
      progressPercent: cohortMetrics.cacPaybackMonths <= 6 ? 100 : Math.max(0, Math.round((6 / cohortMetrics.cacPaybackMonths) * 100)),
    },
    {
      id: 'ach-growth-surge',
      title: 'Top-Line Velocity',
      category: 'Growth',
      tier: 'Epic',
      description: 'Accelerate period-over-period revenue expansion.',
      requirementText: 'Period Growth ≥ +10.0%',
      xpValue: 450,
      unlocked: metrics.revenueGrowthPercent >= 10,
      progressPercent: Math.min(100, Math.max(0, Math.round((metrics.revenueGrowthPercent / 10) * 100))),
    },
    {
      id: 'ach-break-even-buffer',
      title: 'Safety Margin Shield',
      category: 'Profitability',
      tier: 'Uncommon',
      description: 'High distance between actual revenue and break-even sales volume.',
      requirementText: 'Break-Even Safety Margin ≥ 20.0%',
      xpValue: 200,
      unlocked: metrics.breakEvenSafetyMarginPercent >= 20,
      progressPercent: Math.min(100, Math.max(0, Math.round((metrics.breakEvenSafetyMarginPercent / 20) * 100))),
    },
    {
      id: 'ach-multi-region',
      title: 'Regional Footprint',
      category: 'Growth',
      tier: 'Uncommon',
      description: 'Diversify revenue generation across multiple market territories.',
      requirementText: 'Active Markets ≥ 3',
      xpValue: 150,
      unlocked: marketSalesReport.length >= 3,
      progressPercent: Math.min(100, Math.round((marketSalesReport.length / 3) * 100)),
    },
    {
      id: 'ach-century-club',
      title: 'Performance Score 80+',
      category: 'Profitability',
      tier: 'Legendary',
      description: 'Achieve an elite diagnostic score across all four financial engines.',
      requirementText: 'Overall Score ≥ 80 / 100',
      xpValue: 750,
      unlocked: metrics.performanceScore.overallScore >= 80,
      progressPercent: Math.min(100, Math.round((metrics.performanceScore.overallScore / 80) * 100)),
    },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalXP = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xpValue, 0);
  const maxXP = achievements.reduce((sum, a) => sum + a.xpValue, 0);

  const getTierColor = (tier: Achievement['tier']) => {
    switch (tier) {
      case 'Legendary': return '#FF2E63';
      case 'Epic': return '#9945FF';
      case 'Rare': return '#00F0FF';
      case 'Uncommon': return '#00FF88';
    }
  };

  const getTierBadge = (tier: Achievement['tier']) => {
    switch (tier) {
      case 'Legendary': return 'badge-danger';
      case 'Epic': return 'badge-rare';
      case 'Rare': return 'badge-rare';
      case 'Uncommon': return 'badge-uncommon';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* Top Banner */}
      <div className="hud-corner-box" style={{
        padding: '24px 28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
        background: 'linear-gradient(135deg, rgba(255,46,99,0.08) 0%, rgba(0,240,255,0.05) 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 6,
            background: 'linear-gradient(135deg, #FF2E63 0%, #FFB800 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 25px rgba(255, 184, 0, 0.45)', flexShrink: 0,
          }}>
            <Trophy size={28} color="#000003" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontFamily: 'Orbitron', fontSize: 18, fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.06em' }}>
                CORPORATE ACHIEVEMENTS & MILESTONES
              </h1>
              <span className="badge badge-legendary" style={{ fontSize: 9 }}>
                LEVEL {Math.floor(totalXP / 500) + 1}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Live badges unlocked autonomously as {pnlStatement.businessName} hits solvency, margin, and retention targets.
            </p>
          </div>
        </div>

        {/* XP and Badges Summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="hud-metric-card" style={{ padding: '8px 16px', minWidth: 110, textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontFamily: 'Orbitron', color: 'var(--text-muted)' }}>UNLOCKED</div>
            <div style={{ fontSize: 18, fontFamily: 'Orbitron', fontWeight: 900, color: 'var(--cyber-emerald)' }}>
              {unlockedCount} / {achievements.length}
            </div>
          </div>
          <div className="hud-metric-card" style={{ padding: '8px 16px', minWidth: 120, textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontFamily: 'Orbitron', color: 'var(--text-muted)' }}>TOTAL XP</div>
            <div style={{ fontSize: 18, fontFamily: 'Orbitron', fontWeight: 900, color: 'var(--cyber-gold)' }}>
              {totalXP} <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/ {maxXP}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar Header */}
      <div className="hud-corner-box" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={14} color="var(--cyber-gold)" />
            <span style={{ fontFamily: 'Orbitron', fontSize: 11, fontWeight: 800, color: '#FFFFFF' }}>
              MILESTONE COMPLETION RUNWAY
            </span>
          </div>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--cyber-cyan)', fontWeight: 700 }}>
            {Math.round((unlockedCount / achievements.length) * 100)}% UNLOCKED
          </span>
        </div>
        <div style={{ width: '100%', height: 8, background: '#060913', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
          <div style={{
            width: `${(unlockedCount / achievements.length) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #FF2E63 0%, #FFB800 50%, #00FF88 100%)',
            boxShadow: '0 0 10px rgba(0,255,136,0.5)',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Achievement Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
        {achievements.map((ach) => {
          const tierColor = getTierColor(ach.tier);

          return (
            <div
              key={ach.id}
              className="hud-corner-box"
              style={{
                padding: 18,
                display: 'flex', flexDirection: 'column', gap: 10,
                opacity: ach.unlocked ? 1 : 0.72,
                borderColor: ach.unlocked ? `${tierColor}55` : 'var(--border-subtle)',
                background: ach.unlocked ? 'rgba(6, 9, 19, 0.95)' : 'rgba(3, 4, 10, 0.85)',
                boxShadow: ach.unlocked ? `0 0 20px ${tierColor}18` : 'none',
              }}
            >
              {/* Card Top */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 4,
                    background: ach.unlocked ? `${tierColor}20` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${ach.unlocked ? tierColor : 'var(--border-subtle)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {ach.unlocked ? (
                      <CheckCircle2 size={16} color={tierColor} />
                    ) : (
                      <Lock size={14} color="var(--text-muted)" />
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'Orbitron', fontSize: 12, fontWeight: 800, color: ach.unlocked ? '#FFFFFF' : 'var(--text-secondary)' }}>
                      {ach.title}
                    </h3>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'Orbitron' }}>
                      {ach.category}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                  <span className={`badge ${getTierBadge(ach.tier)}`} style={{ fontSize: 8 }}>
                    {ach.tier.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 9, color: 'var(--cyber-gold)', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>
                    +{ach.xpValue} XP
                  </span>
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {ach.description}
              </p>

              {/* Requirement & Progress */}
              <div style={{
                background: '#040711', borderRadius: 4, padding: '8px 10px',
                border: '1px solid var(--border-subtle)',
                marginTop: 'auto',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>
                    TARGET: <strong style={{ color: '#FFFFFF' }}>{ach.requirementText}</strong>
                  </span>
                  <span style={{ color: ach.unlocked ? 'var(--cyber-emerald)' : 'var(--cyber-cyan)', fontWeight: 700 }}>
                    {ach.unlocked ? 'COMPLETED' : `${ach.progressPercent}%`}
                  </span>
                </div>

                <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, ach.progressPercent)}%`,
                    height: '100%',
                    background: ach.unlocked ? 'var(--cyber-emerald)' : 'var(--cyber-cyan)',
                  }} />
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
