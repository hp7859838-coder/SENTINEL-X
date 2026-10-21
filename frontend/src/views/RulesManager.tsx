import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Info,
  Shield,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { SeverityBadge } from '../components/SeverityBadge';
import { DetectionRule } from '../types';
import { api } from '../api/client';

export const RulesManager: React.FC = () => {
  const [rules, setRules] = useState<DetectionRule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Quick edit weight state
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState<number>(30);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const data = await api.getRules();
      setRules(data);
    } catch {
      // Non-fatal
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (rule: DetectionRule) => {
    try {
      const updated = await api.updateRule(rule.id, { is_enabled: !rule.is_enabled });
      setRules((prev) => prev.map((r) => (r.id === rule.id ? updated : r)));
      setMessage(`Rule ${rule.id} is now ${updated.is_enabled ? 'ENABLED' : 'DISABLED'}. Subsequent scans will reflect this immediately.`);
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      alert(`Error toggling rule: ${err.message}`);
    }
  };

  const handleSaveWeight = async (ruleId: string) => {
    try {
      const updated = await api.updateRule(ruleId, { score_weight: Number(editWeight) });
      setRules((prev) => prev.map((r) => (r.id === ruleId ? updated : r)));
      setEditingRuleId(null);
      setMessage(`Rule ${ruleId} weight updated to ${updated.score_weight} pts.`);
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      alert(`Error updating weight: ${err.message}`);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all detection rules to factory defaults?')) return;
    try {
      const defaults = await api.resetRules();
      setRules(defaults);
      setMessage('All detection rules restored to factory defaults.');
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      alert(`Error resetting rules: ${err.message}`);
    }
  };

  const categories = ['ALL', ...Array.from(new Set(rules.map((r) => r.category)))];

  const filteredRules = rules.filter((r) => {
    const matchesCat = selectedCategory === 'ALL' || r.category === selectedCategory;
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <SlidersHorizontal className="w-6 h-6 text-cyan-400" />
            <span>Detection Rules Management</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Configure transparent heuristics, adjust risk weightings, or toggle individual inspection rules.
          </p>
        </div>

        <button
          onClick={handleResetDefaults}
          className="px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition-colors flex items-center space-x-1.5 self-start"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restore Defaults</span>
        </button>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-xl border border-cyan-900/50 bg-cyan-950/20 text-xs text-cyan-300 flex items-start space-x-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Safe Heuristic Execution: </span>
          Rules are compiled as static pattern evaluators without eval(), exec(), or arbitrary code execution.
          Changes are saved to SQLite and applied in real time to subsequent prompt scans.
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-lg border border-emerald-800 bg-emerald-950/40 text-xs font-mono text-emerald-300 flex items-center space-x-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search rules by ID, name, or description..."
            className="w-full bg-[#0d1321] border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#0d1321] text-xs font-mono text-slate-200 border border-slate-800 rounded-lg px-3 py-2 outline-none focus:border-cyan-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rules Table */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="pb-3">Status</th>
              <th className="pb-3">Rule ID</th>
              <th className="pb-3">Rule Name & Details</th>
              <th className="pb-3">Category</th>
              <th className="pb-3">Severity</th>
              <th className="pb-3">Score Contribution</th>
              <th className="pb-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredRules.map((rule) => {
              const isEditing = editingRuleId === rule.id;

              return (
                <tr key={rule.id} className="hover:bg-slate-800/20">
                  <td className="py-3.5">
                    <button
                      onClick={() => handleToggle(rule)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border transition-colors ${
                        rule.is_enabled
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-700/60 hover:bg-emerald-900'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {rule.is_enabled ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="py-3.5 text-cyan-300 font-bold">{rule.id}</td>
                  <td className="py-3.5 max-w-xs">
                    <div className="font-semibold text-slate-200 font-sans">{rule.name}</div>
                    <div className="text-[11px] text-slate-400 font-sans mt-0.5">{rule.description}</div>
                  </td>
                  <td className="py-3.5 text-slate-300">{rule.category}</td>
                  <td className="py-3.5">
                    <SeverityBadge severity={rule.severity} size="sm" />
                  </td>
                  <td className="py-3.5">
                    {isEditing ? (
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={editWeight}
                          onChange={(e) => setEditWeight(Number(e.target.value))}
                          className="w-16 bg-slate-950 border border-cyan-500 rounded px-1.5 py-0.5 text-xs text-white"
                        />
                        <button
                          onClick={() => handleSaveWeight(rule.id)}
                          className="p-1 rounded bg-emerald-800 text-white hover:bg-emerald-700"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setEditingRuleId(null)}
                          className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-amber-300">
                        <span>+{rule.score_weight} pts</span>
                        <button
                          onClick={() => {
                            setEditingRuleId(rule.id);
                            setEditWeight(rule.score_weight);
                          }}
                          className="text-slate-400 hover:text-slate-200"
                          title="Edit score weight"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => handleToggle(rule)}
                      className="text-slate-400 hover:text-cyan-300 transition-colors text-[11px]"
                    >
                      {rule.is_enabled ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
