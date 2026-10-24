import React, { useState, useEffect } from 'react';
import {
  Flame,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Server,
  ArrowRight,
  Send,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { ActionEvaluateResponse, ActionPreset } from '../types';
import { api } from '../api/client';

interface ActionFirewallProps {
  onNavigateToApprovals?: () => void;
  onActionEvaluated?: () => void;
}

export const ActionFirewall: React.FC<ActionFirewallProps> = ({
  onNavigateToApprovals,
  onActionEvaluated,
}) => {
  const [catalog, setCatalog] = useState<ActionPreset[]>([]);
  const [selectedActionType, setSelectedActionType] = useState('READ_PUBLIC_DOCUMENT');
  const [resource, setResource] = useState('synthetic_public/onboarding_guide.md');
  const [parametersText, setParametersText] = useState('{\n  "page": 1,\n  "format": "markdown"\n}');
  const [agentId, setAgentId] = useState('sentinel-agent-01');

  const [evaluation, setEvaluation] = useState<ActionEvaluateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      const presets = await api.getActionCatalog();
      setCatalog(presets);
    } catch {
      // Non-fatal
    }
  };

  const handleSelectPreset = (preset: ActionPreset) => {
    setSelectedActionType(preset.action_type);
    setResource(preset.resource);
    setParametersText(JSON.stringify(preset.parameters, null, 2));
    setEvaluation(null);
    setError(null);
  };

  const handleEvaluate = async () => {
    let parsedParams = {};
    try {
      parsedParams = parametersText.trim() ? JSON.parse(parametersText) : {};
    } catch (e: any) {
      setError(`Invalid JSON parameters: ${e.message}`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.evaluateAction(selectedActionType, resource, parsedParams, agentId);
      setEvaluation(res);
      if (res.requires_approval && onActionEvaluated) {
        onActionEvaluated();
      }
    } catch (err: any) {
      setError(err.message || 'Firewall evaluation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedActionType('READ_PUBLIC_DOCUMENT');
    setResource('synthetic_public/onboarding_guide.md');
    setParametersText('{\n  "page": 1,\n  "format": "markdown"\n}');
    setEvaluation(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Flame className="w-6 h-6 text-cyan-400" />
          <span>Agent Action Firewall</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Server-enforced policy gateway that inspects and authorizes every proposed autonomous agent action before execution.
        </p>
      </div>

      {/* Safety & Simulation Notice */}
      <div className="p-4 rounded-xl border border-cyan-900/50 bg-cyan-950/20 text-xs text-cyan-300 flex items-start space-x-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Strict Simulation Sandbox: </span>
          All action requests represent simulated agent intents. Sentinel-X does not run shell commands, launch processes,
          or make unconstrained network calls. The firewall fails closed on unknown or malformed requests.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Workbench Console */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur space-y-4">
            <div className="text-xs font-mono uppercase text-slate-400 tracking-wider font-semibold">
              Proposed Agent Action Inspector
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Action Type</label>
                <input
                  type="text"
                  value={selectedActionType}
                  onChange={(e) => setSelectedActionType(e.target.value)}
                  placeholder="e.g. READ_PUBLIC_DOCUMENT"
                  className="w-full bg-[#0a0e17] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Requesting Agent ID</label>
                <input
                  type="text"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  className="w-full bg-[#0a0e17] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Target Resource</label>
              <input
                type="text"
                value={resource}
                onChange={(e) => setResource(e.target.value)}
                placeholder="e.g. synthetic_restricted/financial_audit.enc"
                className="w-full bg-[#0a0e17] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:border-cyan-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Action Parameters (JSON)
              </label>
              <textarea
                value={parametersText}
                onChange={(e) => setParametersText(e.target.value)}
                rows={5}
                className="w-full bg-[#0a0e17] border border-slate-700 rounded-lg p-3 text-xs text-slate-200 font-mono focus:border-cyan-500 outline-none resize-y"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg border border-red-800/80 bg-red-950/30 text-xs text-red-300 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleReset}
                disabled={loading}
                className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-mono flex items-center space-x-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                onClick={handleEvaluate}
                disabled={loading || !selectedActionType.trim() || !resource.trim()}
                className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-mono font-bold flex items-center space-x-2 transition-colors shadow-lg shadow-cyan-950 disabled:opacity-40"
              >
                <Send className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Evaluating Policy...' : 'Submit to Policy Gateway'}</span>
              </button>
            </div>
          </div>

          {/* Action Catalog Presets */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>SIMULATED ACTION CATALOG & POLICIES</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {catalog.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className="p-3 rounded-lg border border-slate-800 bg-slate-900/80 hover:border-cyan-800/70 hover:bg-cyan-950/20 text-left transition-colors flex flex-col justify-between group"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                      {preset.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {preset.description}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-[10px] font-mono border-t border-slate-800/80 pt-2">
                    <span className="text-slate-400 truncate max-w-[120px]">{preset.resource}</span>
                    <StatusBadge status={preset.expected_decision} size="sm" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Policy Verdict Panel */}
        <div className="space-y-4">
          {evaluation ? (
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono uppercase text-slate-400 font-semibold">
                  Gateway Policy Verdict
                </span>
                <span className="text-[11px] font-mono text-slate-400">{evaluation.decision_id}</span>
              </div>

              {/* Decision Box */}
              <div
                className={`p-5 rounded-xl border text-center space-y-2 ${
                  evaluation.decision === 'ALLOW'
                    ? 'border-emerald-800/80 bg-emerald-950/30'
                    : evaluation.decision === 'BLOCK'
                    ? 'border-red-800/80 bg-red-950/30'
                    : 'border-amber-800/80 bg-amber-950/30'
                }`}
              >
                <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                  DECISION OUTCOME
                </div>
                <div className="text-2xl font-black font-mono tracking-wider">
                  <StatusBadge status={evaluation.decision} size="lg" />
                </div>
                <div className="text-xs font-mono text-slate-300">
                  Enforced Policy: <span className="font-bold text-cyan-300">{evaluation.policy_name}</span>
                </div>
              </div>

              {/* Explanation */}
              <div>
                <div className="text-xs font-mono text-slate-400 mb-1">POLICY JUSTIFICATION</div>
                <div className="text-xs text-slate-300 bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 leading-relaxed">
                  {evaluation.reason}
                </div>
              </div>

              {/* If Require Approval */}
              {evaluation.requires_approval && (
                <div className="p-3.5 rounded-lg border border-amber-800/60 bg-amber-950/30 text-xs text-amber-200 space-y-2">
                  <div className="flex items-center space-x-2 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Action Dispatched to Approval Queue</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-300">
                    Request ID: {evaluation.approval_request_id}
                  </div>
                  {onNavigateToApprovals && (
                    <button
                      onClick={onNavigateToApprovals}
                      className="w-full mt-1 px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold font-mono transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <span>Open Approval Queue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* Action Metadata */}
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] font-mono space-y-1.5 text-slate-400">
                <div className="flex justify-between">
                  <span>Action Type:</span>
                  <span className="text-slate-200 font-semibold">{evaluation.action_type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Target:</span>
                  <span className="text-slate-200 truncate max-w-[150px]">{evaluation.resource}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sandbox Mode:</span>
                  <span className="text-emerald-400">SIMULATED (SAFE)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xl border border-dashed border-slate-800 bg-slate-900/20 text-center text-slate-400 space-y-3">
              <Server className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-xs font-mono">
                No active evaluation. Choose a simulated action preset or configure a custom action to observe policy enforcement.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
