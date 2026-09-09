'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/app-context';
import { useSession, signOut } from 'next-auth/react';
import { Bot, FileSpreadsheet, Bell, LogOut } from 'lucide-react';

export default function TopBar() {
  const {
    currentPage, setCurrentPage,
    metrics, setIsReportModalOpen,
    notificationOpen, setNotificationOpen,
    notifications,
  } = useApp();
  const { data: session } = useSession();

  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().slice(0, 5));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const pageTitle: Record<string, string> = {
    dashboard: 'AI CONSORTIUM // REAL-TIME METRICS',
    'pnl-analyzer': 'P&L INCOME STATEMENT AUDIT // RECONCILED',
    'balance-sheet': 'BALANCE SHEET & LIQUIDITY // SOLVENCY ENGINE',
    'market-sales': 'REGIONAL SALES & QUOTA VARIANCE // ANALYSIS',
    'cohort-analysis': 'CUSTOMER COHORT RETENTION & NRR // MATRIX',
    'ai-cofounder': 'AI STRATEGIC COMMAND // EXECUTION ROADMAP',
    growth: 'BREAK-EVEN & WHAT-IF SIMULATOR // MODELING',
    reports: 'DATA PACKAGES & FINANCIAL EXPORTS // CSV-PDF',
    settings: 'SYSTEM ARCHITECTURE & CONFIGURATION',
    achievements: 'ACHIEVEMENTS & MILESTONES // GAMIFICATION',
  };

  const criticalCount = notifications.filter(n => n.severity === 'critical').length;
  const warningCount = notifications.filter(n => n.severity === 'warning').length;
  const alertCount = criticalCount + warningCount;

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      height: 56,
      background: 'rgba(2, 3, 8, 0.95)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-hud)',
      display: 'flex', alignItems: 'center',
      padding: '0 20px', gap: 16,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
    }}>
      
      {/* Level & XP HUD Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(0, 255, 136, 0.1)',
          border: '1px solid rgba(0, 255, 136, 0.35)',
          padding: '3px 8px', borderRadius: 3,
        }}>
          <span style={{ fontFamily: 'Orbitron', fontSize: 11, fontWeight: 900, color: 'var(--cyber-emerald)' }}>
            {metrics.performanceScore.overallScore}
          </span>
          <span style={{ fontFamily: 'Orbitron', fontSize: 9, fontWeight: 700, color: 'var(--text-muted)' }}>
            SCORE
          </span>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'rgba(255, 184, 0, 0.1)',
          border: '1px solid rgba(255, 184, 0, 0.35)',
          padding: '3px 8px', borderRadius: 3,
        }}>
          <span style={{ fontSize: 10, color: 'var(--cyber-gold)', fontWeight: 800 }}>+</span>
          <span style={{ fontFamily: 'Orbitron', fontSize: 11, fontWeight: 800, color: 'var(--cyber-gold)' }}>
            {(!isFinite(metrics.grossMarginPercent) || isNaN(metrics.grossMarginPercent)) ? 0 : (metrics.grossMarginPercent * 25).toFixed(0)}
          </span>
          <span style={{ fontFamily: 'Orbitron', fontSize: 9, fontWeight: 700, color: 'var(--text-muted)' }}>
            XP
          </span>
        </div>
      </div>

      {/* Title / Module Indicator */}
      <div style={{ flex: 1, minWidth: 0, paddingLeft: 8 }}>
        <h2 style={{
          fontFamily: 'Orbitron', fontSize: 12, fontWeight: 800,
          color: '#FFFFFF', letterSpacing: '0.06em',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {pageTitle[currentPage] ?? 'AI CONSORTIUM // ENTERPRISE SYSTEM'}
        </h2>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        
        {/* System Time */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)'
        }}>
          {timeStr && <span>SYS_TIME: <strong style={{ color: 'var(--cyber-cyan)' }}>{timeStr}</strong></span>}
          <span>● <strong style={{ color: 'var(--cyber-emerald)' }}>ONLINE</strong></span>
        </div>

        {/* Notification Bell */}
        <button
          id="topbar-notifications-btn"
          onClick={() => setNotificationOpen(!notificationOpen)}
          className="btn-ghost"
          style={{
            padding: '5px 8px', fontSize: 10, fontFamily: 'Orbitron',
            position: 'relative',
          }}
          title="System Alerts"
        >
          <Bell size={14} color={alertCount > 0 ? (criticalCount > 0 ? 'var(--cyber-red)' : '#F59E0B') : 'var(--text-muted)'} />
          {alertCount > 0 && (
            <span style={{
              position: 'absolute', top: 2, right: 2,
              width: 8, height: 8, borderRadius: '50%',
              background: criticalCount > 0 ? 'var(--cyber-red)' : '#F59E0B',
              border: '1px solid var(--bg-base)',
            }} />
          )}
        </button>

        {/* Sync P&L Removed per request */}

        {/* AI Command */}
        <button
          id="topbar-ai-chat-btn"
          className="btn-primary"
          style={{ padding: '6px 14px', fontSize: 10 }}
          onClick={() => setCurrentPage('ai-cofounder')}
        >
          <Bot size={13} />
          AI COMMAND
        </button>

        {/* User session + Logout */}
        {session?.user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)',
              maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {session.user.email}
            </div>
            <button
              className="btn-ghost"
              onClick={() => signOut({ callbackUrl: '/login' })}
              style={{ padding: '4px 6px' }}
              title="Sign out"
            >
              <LogOut size={12} color="var(--text-muted)" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
