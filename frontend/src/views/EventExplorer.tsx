import React, { useState, useEffect } from 'react';
import {
  ScrollText,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Info,
  Calendar,
  Layers,
  ShieldAlert,
} from 'lucide-react';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { EventLog } from '../types';
import { api } from '../api/client';

export const EventExplorer: React.FC = () => {
  const [events, setEvents] = useState<EventLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedDecision, setSelectedDecision] = useState('ALL');
  const [loading, setLoading] = useState(false);

  // Inspector Modal
  const [inspectedEvent, setInspectedEvent] = useState<EventLog | null>(null);

  useEffect(() => {
    loadEvents();
  }, [selectedType, selectedSeverity, selectedDecision]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await api.getEvents({
        query: query.trim() || undefined,
        event_type: selectedType === 'ALL' ? undefined : selectedType,
        severity: selectedSeverity === 'ALL' ? undefined : selectedSeverity,
        decision: selectedDecision === 'ALL' ? undefined : selectedDecision,
        limit: 100,
      });
      setEvents(res.events);
      setTotalCount(res.total);
    } catch {
      // Non-fatal
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadEvents();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <ScrollText className="w-6 h-6 text-cyan-400" />
            <span>Event Explorer & Immutable Audit Trail</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Centralized security event journal recording prompt scans, policy decisions, approvals, and system state modifications.
          </p>
        </div>

        <button
          onClick={loadEvents}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition-colors self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Audit</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search audit trail by Event ID, reason, or keyword..."
              className="w-full bg-[#0a0e17] border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-mono font-bold transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-[#0a0e17] text-slate-200 border border-slate-800 rounded px-2.5 py-1 outline-none"
            >
              <option value="ALL">All Event Types</option>
              <option value="PROMPT_SCAN">PROMPT_SCAN</option>
              <option value="FIREWALL_DECISION">FIREWALL_DECISION</option>
              <option value="APPROVAL_REQUEST">APPROVAL_REQUEST</option>
              <option value="APPROVAL_OUTCOME">APPROVAL_OUTCOME</option>
              <option value="SIMULATION_RUN">SIMULATION_RUN</option>
              <option value="RULE_UPDATE">RULE_UPDATE</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Severity:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-[#0a0e17] text-slate-200 border border-slate-800 rounded px-2.5 py-1 outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MODERATE">MODERATE</option>
              <option value="LOW">LOW</option>
              <option value="INFO">INFO</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Decision:</span>
            <select
              value={selectedDecision}
              onChange={(e) => setSelectedDecision(e.target.value)}
              className="bg-[#0a0e17] text-slate-200 border border-slate-800 rounded px-2.5 py-1 outline-none"
            >
              <option value="ALL">All Decisions</option>
              <option value="ALLOW">ALLOW</option>
              <option value="BLOCK">BLOCK</option>
              <option value="REQUIRE_APPROVAL">REQUIRE_APPROVAL</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="PASSED">PASSED</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          <div className="ml-auto text-slate-400 text-xs">
            Showing {events.length} of {totalCount} records
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur overflow-x-auto">
        {events.length > 0 ? (
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Event ID</th>
                <th className="pb-3">Event Type</th>
                <th className="pb-3">Summary</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3">Decision</th>
                <th className="pb-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {events.map((evt) => {
                const timeStr = evt.timestamp ? new Date(evt.timestamp).toLocaleString() : 'N/A';

                return (
                  <tr key={evt.id} className="hover:bg-slate-800/30">
                    <td className="py-3 text-slate-400 whitespace-nowrap">{timeStr}</td>
                    <td className="py-3 text-slate-200 font-bold">{evt.id}</td>
                    <td className="py-3 text-cyan-400">{evt.event_type}</td>
                    <td className="py-3 text-slate-300 font-sans max-w-sm truncate" title={evt.summary}>
                      {evt.summary}
                    </td>
                    <td className="py-3">
                      <SeverityBadge severity={evt.severity} size="sm" />
                    </td>
                    <td className="py-3">
                      {evt.decision ? (
                        <StatusBadge status={evt.decision} size="sm" />
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setInspectedEvent(evt)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center text-slate-400 font-mono text-xs">
            No audit records match the selected filters.
          </div>
        )}
      </div>

      {/* Event Details Inspector Modal */}
      {inspectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl max-h-[85vh] flex flex-col p-6 rounded-2xl border border-slate-700 bg-[#0d1321] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ScrollText className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-mono">
                  Audit Record: {inspectedEvent.id}
                </h3>
              </div>
              <button
                onClick={() => setInspectedEvent(null)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-slate-400 block">TYPE</span>
                  <span className="text-cyan-300 font-bold">{inspectedEvent.event_type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">SEVERITY</span>
                  <SeverityBadge severity={inspectedEvent.severity} size="sm" />
                </div>
                <div>
                  <span className="text-slate-400 block">DECISION</span>
                  {inspectedEvent.decision ? (
                    <StatusBadge status={inspectedEvent.decision} size="sm" />
                  ) : (
                    <span>N/A</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-400 block">TIMESTAMP</span>
                  <span className="text-slate-300">
                    {inspectedEvent.timestamp ? new Date(inspectedEvent.timestamp).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">SUMMARY</span>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-sans leading-relaxed">
                  {inspectedEvent.summary}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">POLICY JUSTIFICATION / REASON</span>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-sans leading-relaxed">
                  {inspectedEvent.reason}
                </div>
              </div>

              {inspectedEvent.related_id && (
                <div>
                  <span className="text-slate-400 block mb-1">CORRELATED IDENTIFIER</span>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400">
                    {inspectedEvent.related_id}
                  </div>
                </div>
              )}

              <div>
                <span className="text-slate-400 block mb-1">STRUCTURED AUDIT PAYLOAD (JSON)</span>
                <pre className="p-3.5 rounded-lg bg-[#080c14] border border-slate-800 text-emerald-400 text-[11px] overflow-x-auto">
                  {JSON.stringify(inspectedEvent.details, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectedEvent(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
