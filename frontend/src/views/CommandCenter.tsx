import React, { useEffect, useState } from 'react';
import {
  ScanEye,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Activity,
  ArrowRight,
  ShieldX,
  FileCheck2,
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { DashboardMetrics } from '../types';
import { api } from '../api/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface CommandCenterProps {
  onNavigate: (view: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ onNavigate }) => {
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await api.getDashboardStats();
      setData(stats);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Activity className="w-8 h-8 animate-spin text-cyan-400 mb-3" />
        <p className="text-sm font-mono">Aggregating telemetry from database...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6 rounded-xl border border-red-800/80 bg-red-950/20 text-red-300">
        <h3 className="font-semibold text-base mb-1">Telemetry Connection Error</h3>
        <p className="text-sm">{error}</p>
        <button
          onClick={loadData}
          className="mt-3 px-4 py-1.5 rounded bg-red-800 hover:bg-red-700 text-xs font-mono text-white transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const chartData = [
    { name: 'Low', count: data?.severity_distribution.low || 0, color: '#14b8a6' },
    { name: 'Moderate', count: data?.severity_distribution.moderate || 0, color: '#f59e0b' },
    { name: 'High', count: data?.severity_distribution.high || 0, color: '#f43f5e' },
    { name: 'Critical', count: data?.severity_distribution.critical || 0, color: '#ef4444' },
    { name: 'Info', count: data?.severity_distribution.info || 0, color: '#06b6d4' },
  ];

  return (
    <div className="space-y-6">
      {/* Platform Banner */}
      <div className="p-5 rounded-2xl border border-cyan-900/40 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-slate-900/80 backdrop-blur flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono tracking-widest uppercase mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>AI AGENT DEFENSIVE SECURITY SUITE</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Security Command Center
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Live telemetry monitoring untrusted prompt injections, simulated agent action policy decisions, and human verification queues.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('scanner')}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold font-mono transition-colors shadow-lg shadow-cyan-950 flex items-center space-x-1.5"
          >
            <span>Scan Prompt</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('simulations')}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-mono transition-colors flex items-center space-x-1.5"
          >
            <span>Run Threat Lab</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Scanned Inputs"
          value={data?.total_scanned_events ?? 0}
          subtitle="Total prompts analyzed"
          icon={<ScanEye className="w-4 h-4" />}
          variant="cyan"
          onClick={() => onNavigate('scanner')}
        />
        <MetricCard
          title="Flagged Inputs"
          value={data?.flagged_inputs ?? 0}
          subtitle="Score >= 25 (Moderate to Crit)"
          icon={<AlertTriangle className="w-4 h-4" />}
          variant={data && data.flagged_inputs > 0 ? 'warning' : 'default'}
          onClick={() => onNavigate('scanner')}
        />
        <MetricCard
          title="High & Critical"
          value={data?.high_and_critical_findings ?? 0}
          subtitle="Severe injection indicators"
          icon={<ShieldAlert className="w-4 h-4" />}
          variant={data && data.high_and_critical_findings > 0 ? 'danger' : 'default'}
          onClick={() => onNavigate('scanner')}
        />
        <MetricCard
          title="Pending Approvals"
          value={data?.pending_approval_requests ?? 0}
          subtitle="Requires human authorization"
          icon={<Clock className="w-4 h-4" />}
          variant={data && data.pending_approval_requests > 0 ? 'warning' : 'default'}
          onClick={() => onNavigate('approvals')}
        />
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Allowed Actions"
          value={data?.allowed_actions ?? 0}
          subtitle="Public reads within policy"
          icon={<ShieldCheck className="w-4 h-4" />}
          variant="success"
          onClick={() => onNavigate('firewall')}
        />
        <MetricCard
          title="Blocked Actions"
          value={data?.blocked_actions ?? 0}
          subtitle="Restricted/Exfil/Fail-closed"
          icon={<ShieldX className="w-4 h-4" />}
          variant={data && data.blocked_actions > 0 ? 'danger' : 'default'}
          onClick={() => onNavigate('firewall')}
        />
        <MetricCard
          title="Total Audit Events"
          value={data?.total_audit_events ?? 0}
          subtitle="Stored immutable records"
          icon={<FileCheck2 className="w-4 h-4" />}
          variant="default"
          onClick={() => onNavigate('events')}
        />
      </div>

      {/* Charts & Latest Policy Decisions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Severity Chart */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-200">Severity Distribution</h3>
            <span className="text-xs font-mono text-slate-400">Database telemetry</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latest Policy Decisions */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-200">Latest Policy Gateway Decisions</h3>
            <button
              onClick={() => onNavigate('firewall')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center space-x-1"
            >
              <span>Firewall Engine</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {data?.latest_decisions && data.latest_decisions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="pb-2">Timestamp</th>
                    <th className="pb-2">Action Type</th>
                    <th className="pb-2">Target Resource</th>
                    <th className="pb-2">Decision</th>
                    <th className="pb-2">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.latest_decisions.map((dec: any, idx: number) => {
                    const timeStr = dec.timestamp ? new Date(dec.timestamp).toLocaleTimeString() : 'N/A';
                    return (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2.5 font-mono text-slate-400">{timeStr}</td>
                        <td className="py-2.5 font-mono text-cyan-300">{dec.details?.action_type || 'N/A'}</td>
                        <td className="py-2.5 font-mono text-slate-300 truncate max-w-[140px]">
                          {dec.details?.resource || 'N/A'}
                        </td>
                        <td className="py-2.5">
                          <StatusBadge status={dec.decision} size="sm" />
                        </td>
                        <td className="py-2.5 text-slate-400 truncate max-w-[200px]" title={dec.reason}>
                          {dec.reason}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 font-mono text-xs">
              No firewall decisions recorded yet. Test an action in the Action Firewall or run the Threat Lab.
            </div>
          )}
        </div>
      </div>

      {/* Recent Security Events */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-200">Recent Security Audit Trail</h3>
          <button
            onClick={() => onNavigate('events')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center space-x-1"
          >
            <span>Open Explorer</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {data?.recent_events && data.recent_events.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="pb-2">Time</th>
                  <th className="pb-2">Event ID</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Summary</th>
                  <th className="pb-2">Severity</th>
                  <th className="pb-2">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {data.recent_events.map((evt) => {
                  const timeStr = evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : 'N/A';
                  return (
                    <tr key={evt.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 text-slate-400">{timeStr}</td>
                      <td className="py-2.5 text-slate-300 font-semibold">{evt.id}</td>
                      <td className="py-2.5 text-cyan-400">{evt.event_type}</td>
                      <td className="py-2.5 text-slate-200 font-sans max-w-xs truncate" title={evt.summary}>
                        {evt.summary}
                      </td>
                      <td className="py-2.5">
                        <SeverityBadge severity={evt.severity} size="sm" />
                      </td>
                      <td className="py-2.5">
                        {evt.decision ? <StatusBadge status={evt.decision} size="sm" /> : <span className="text-slate-400">-</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 font-mono text-xs">
            Audit trail is currently empty. Run a prompt scan or firewall action to populate live records.
          </div>
        )}
      </div>
    </div>
  );
};
