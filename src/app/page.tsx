'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AppProvider, useApp } from '@/lib/app-context';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import AIChatPanel from '@/components/AIChatPanel';
import ReportSubmissionModal from '@/components/ReportSubmissionModal';

// Pages
import DashboardPage from '@/components/pages/DashboardPage';
import PnLAnalyzerPage from '@/components/pages/PnLAnalyzerPage';
import BalanceSheetPage from '@/components/pages/BalanceSheetPage';
import MarketSalesPage from '@/components/pages/MarketSalesPage';
import CohortAnalysisPage from '@/components/pages/CohortAnalysisPage';
import AIPage from '@/components/pages/AIPage';
import GrowthPage from '@/components/pages/GrowthPage';
import ReportsPage from '@/components/pages/ReportsPage';
import SettingsPage from '@/components/pages/SettingsPage';
import AchievementsPage from '@/components/pages/AchievementsPage';
import NotificationPanel from '@/components/NotificationPanel';
import { Cpu } from 'lucide-react';

function PageRouter() {
  const { currentPage } = useApp();

  const pages: Record<string, React.ReactNode> = {
    dashboard:         <DashboardPage />,
    'pnl-analyzer':    <PnLAnalyzerPage />,
    'balance-sheet':   <BalanceSheetPage />,
    'market-sales':    <MarketSalesPage />,
    'cohort-analysis': <CohortAnalysisPage />,
    'ai-cofounder':    <AIPage />,
    growth:            <GrowthPage />,
    reports:           <ReportsPage />,
    settings:          <SettingsPage />,
    achievements:      <AchievementsPage />,
  };

  return <>{pages[currentPage] ?? <DashboardPage />}</>;
}

function AppShell() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', overflow: 'hidden', position: 'relative' }}>
      <Sidebar />
      <div className="main-layout">
        <TopBar />
        <main className="page-content">
          <PageRouter />
        </main>
      </div>
      <AIChatPanel />
      <ReportSubmissionModal />
      <NotificationPanel />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 8,
        background: 'linear-gradient(135deg, #FF2E63 0%, #00F0FF 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 20px rgba(255,46,99,0.4)',
        animation: 'pulse 1.5s infinite',
      }}>
        <Cpu size={28} color="#000003" />
      </div>
      <p style={{ fontFamily: 'Orbitron', fontSize: 12, color: 'var(--text-muted)' }}>
        INITIALIZING SYSTEM...
      </p>
    </div>
  );
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading' || !session) return <LoadingScreen />;

  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
