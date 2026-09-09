'use client';

import React from 'react';
import { useApp } from '@/lib/app-context';
import {
  LayoutDashboard, FileSpreadsheet, Landmark, Globe,
  Users, Bot, Target, FileBarChart, Settings,
  PlusCircle, Zap, Trophy
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard',       label: 'Dashboard Overview',        icon: LayoutDashboard },
  { id: 'pnl-analyzer',    label: 'P&L Statement Audit',       icon: FileSpreadsheet },
  { id: 'balance-sheet',   label: 'Balance Sheet & Liquidity', icon: Landmark },
  { id: 'market-sales',    label: 'Market & Sales Variance',   icon: Globe },
  { id: 'cohort-analysis', label: 'Cohort Retention & NRR',    icon: Users },
  { id: 'ai-cofounder',    label: 'AI Co-Founder (Plan)',      icon: Bot, highlight: true },
  { id: 'growth',          label: 'Break-Even & Targets',      icon: Target },
  { id: 'achievements',    label: 'Achievements & Badges',     icon: Trophy },
  { id: 'reports',         label: 'Data Reports & Export',     icon: FileBarChart },
  { id: 'settings',        label: 'System Configuration',      icon: Settings },
] as const;

export default function Sidebar() {
  const { currentPage, setCurrentPage, setIsReportModalOpen } = useApp();

  return (
    <aside className="sidebar">
      
      {/* Clean HUD Logo Header — "AI CONSORTIUM" */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border-hud)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Cyber Glowing Logo */}
          <div style={{
            width: 40, height: 40, borderRadius: 6,
            background: 'linear-gradient(135deg, #FF2E63 0%, #9945FF 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(255, 46, 99, 0.55)',
            flexShrink: 0,
          }}>
            <Zap size={22} color="#FFFFFF" />
          </div>

          <div>
            <div style={{
              fontFamily: 'Orbitron',
              fontSize: 14,
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '0.08em',
              lineHeight: 1.1,
            }}>
              AI CONSORTIUM
            </div>
            <div style={{
              fontSize: 9,
              color: 'var(--cyber-cyan)',
              fontFamily: 'Orbitron',
              fontWeight: 700,
              letterSpacing: '0.06em',
              marginTop: 3,
            }}>
              ENTERPRISE PLATFORM
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links — Clean without unwanted sequence numbers */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
        <div style={{
          fontSize: 9, fontFamily: 'Orbitron', fontWeight: 700,
          letterSpacing: '0.1em', color: 'var(--text-muted)',
          padding: '4px 8px 8px', textTransform: 'uppercase'
        }}>
          NAVIGATION
        </div>

        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          const isHighlight = (item as { highlight?: boolean }).highlight;

          return (
            <button
              key={item.id}
              className={`sidebar-link ${active ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id as Parameters<typeof setCurrentPage>[0])}
              style={isHighlight && !active ? {
                borderColor: 'rgba(0, 240, 255, 0.3)',
                background: 'rgba(0, 240, 255, 0.05)',
                color: 'var(--cyber-cyan)',
              } : undefined}
            >
              <Icon size={15} style={{
                flexShrink: 0,
                color: active ? '#FFFFFF' : isHighlight ? 'var(--cyber-cyan)' : 'var(--text-muted)'
              }} />

              <span style={{ fontSize: 12, flex: 1 }}>{item.label}</span>

              {isHighlight && !active && (
                <span className="badge badge-rare" style={{ fontSize: 8, padding: '1px 5px' }}>AI</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Upload Statement Action */}
      <div style={{ padding: '14px 14px', borderTop: '1px solid var(--border-hud)', background: '#000003' }}>
        <button
          className="btn-primary"
          style={{ width: '100%', fontSize: 10, padding: '9px 10px', justifyContent: 'center' }}
          onClick={() => setIsReportModalOpen(true)}
        >
          <PlusCircle size={13} />
          UPLOAD REPORT [SYNC]
        </button>
      </div>

    </aside>
  );
}
