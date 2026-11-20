import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AccountProvider } from './context/AccountContext';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { JournalPage } from './pages/JournalPage';
import { AddTradePage } from './pages/AddTradePage';
import { AccountsPage } from './pages/AccountsPage';
import { StrategiesPage } from './pages/StrategiesPage';
import { RiskCenterPage } from './pages/RiskCenterPage';
import { CalendarPage } from './pages/CalendarPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { GoalsPage } from './pages/GoalsPage';
import { CoachPage } from './pages/CoachPage';
import { ReportsPage } from './pages/ReportsPage';
import type { Trade } from './types';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'journal':
        return (
          <JournalPage
            onAddTrade={() => {
              setEditingTrade(null);
              setCurrentTab('add-trade');
            }}
            onEditTrade={(trade) => {
              setEditingTrade(trade);
              setCurrentTab('add-trade');
            }}
          />
        );
      case 'add-trade':
        return (
          <AddTradePage
            initialTrade={editingTrade}
            onSuccess={() => {
              setEditingTrade(null);
              setCurrentTab('journal');
            }}
            onCancel={() => {
              setEditingTrade(null);
              setCurrentTab('journal');
            }}
          />
        );
      case 'accounts':
        return <AccountsPage />;
      case 'strategies':
        return <StrategiesPage />;
      case 'risk':
        return <RiskCenterPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'goals':
        return <GoalsPage />;
      case 'coach':
        return <CoachPage />;
      case 'reports':
        return <ReportsPage />;
      default:
        return <DashboardPage onNavigate={(tab) => setCurrentTab(tab)} />;
    }
  };

  return (
    <AccountProvider>
      <Layout currentTab={currentTab} setCurrentTab={setCurrentTab}>
        {renderActiveTab()}
      </Layout>
    </AccountProvider>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
