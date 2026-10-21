import React, { useState } from 'react';
import {
  ShieldAlert,
  LayoutDashboard,
  ScanEye,
  Flame,
  CheckSquare,
  FlaskConical,
  SlidersHorizontal,
  ScrollText,
  FileDown,
  Menu,
  X,
  RefreshCw,
  Lock,
} from 'lucide-react';

interface LayoutProps {
  currentView: string;
  onNavigate: (view: string) => void;
  pendingApprovalsCount?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  currentView,
  onNavigate,
  pendingApprovalsCount = 0,
  onRefresh,
  isRefreshing = false,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'scanner', label: 'Prompt Scanner', icon: <ScanEye className="w-5 h-5" /> },
    { id: 'firewall', label: 'Action Firewall', icon: <Flame className="w-5 h-5" /> },
    {
      id: 'approvals',
      label: 'Approval Queue',
      icon: <CheckSquare className="w-5 h-5" />,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
    },
    { id: 'simulations', label: 'Threat Lab', icon: <FlaskConical className="w-5 h-5" /> },
    { id: 'rules', label: 'Detection Rules', icon: <SlidersHorizontal className="w-5 h-5" /> },
    { id: 'events', label: 'Event Explorer', icon: <ScrollText className="w-5 h-5" /> },
    { id: 'reports', label: 'Reports & Export', icon: <FileDown className="w-5 h-5" /> },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-[#0d1321] shrink-0">
        {/* Wordmark */}
        <div className="p-5 border-b border-slate-800/80 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-900/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold tracking-wider text-base text-white flex items-center space-x-1.5">
              <span>SENTINEL</span>
              <span className="text-cyan-400">-X</span>
            </div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              AI Guardian v1.0
            </div>
          </div>
        </div>

        {/* System Status Pill */}
        <div className="px-5 py-3 border-b border-slate-800/50 bg-slate-950/40">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">GATEWAY</span>
            <span className="inline-flex items-center text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              ENFORCING
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={active ? 'text-cyan-400' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Security Role Info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400">
          <div className="flex items-center space-x-2 text-slate-300 font-mono mb-1">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">SEC-ADMIN</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Local Security Gateway Mode
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 bg-[#0d1321]/80 backdrop-blur px-4 md:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-baseline space-x-2">
              <span className="font-mono text-xs uppercase tracking-wider text-cyan-400 font-medium">
                {currentView}
              </span>
              <span className="text-slate-500 text-sm hidden sm:inline">/</span>
              <h1 className="text-base md:text-lg font-semibold text-slate-100 capitalize">
                {navItems.find((n) => n.id === currentView)?.label || currentView}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-mono text-slate-300 transition-colors disabled:opacity-50"
                title="Refresh application telemetry"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Sync State</span>
              </button>
            )}
            <div className="hidden sm:flex items-center px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-2" />
              FAIL-CLOSED ACTIVE
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-[#0d1321] p-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                  currentView === item.id
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Main View Container */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
