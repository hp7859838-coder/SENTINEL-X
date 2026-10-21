import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { CommandCenter } from './views/CommandCenter';
import { PromptScanner } from './views/PromptScanner';
import { ActionFirewall } from './views/ActionFirewall';
import { ApprovalQueue } from './views/ApprovalQueue';
import { ThreatLab } from './views/ThreatLab';
import { RulesManager } from './views/RulesManager';
import { EventExplorer } from './views/EventExplorer';
import { ReportCenter } from './views/ReportCenter';
import { api } from './api/client';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchGlobalState = async () => {
    try {
      setIsRefreshing(true);
      const approvals = await api.getApprovals('PENDING');
      setPendingApprovalsCount(approvals.length);
      setRefreshKey((k) => k + 1);
    } catch {
      // Non-fatal
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGlobalState();
    // Refresh counts every 20 seconds
    const interval = setInterval(fetchGlobalState, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    fetchGlobalState();
  };

  return (
    <Layout
      currentView={currentView}
      onNavigate={handleNavigate}
      pendingApprovalsCount={pendingApprovalsCount}
      onRefresh={fetchGlobalState}
      isRefreshing={isRefreshing}
    >
      <div key={refreshKey}>
        {currentView === 'dashboard' && <CommandCenter onNavigate={handleNavigate} />}
        {currentView === 'scanner' && <PromptScanner />}
        {currentView === 'firewall' && (
          <ActionFirewall onNavigateToApprovals={() => handleNavigate('approvals')} />
        )}
        {currentView === 'approvals' && <ApprovalQueue />}
        {currentView === 'simulations' && <ThreatLab />}
        {currentView === 'rules' && <RulesManager />}
        {currentView === 'events' && <EventExplorer />}
        {currentView === 'reports' && <ReportCenter />}
      </div>
    </Layout>
  );
};

export default App;
