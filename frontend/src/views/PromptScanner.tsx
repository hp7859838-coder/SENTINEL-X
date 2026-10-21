import React, { useState, useEffect } from 'react';
import {
  ScanEye,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  History,
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
} from 'lucide-react';
import { SeverityBadge } from '../components/SeverityBadge';
import { ScanResult, ScanSample, EventLog } from '../types';
import { api } from '../api/client';

export const PromptScanner: React.FC = () => {
  const [content, setContent] = useState('');
  const [inputType, setInputType] = useState('text');
  const [samples, setSamples] = useState<ScanSample[]>([]);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<EventLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSamples();
    loadHistory();
  }, []);

  const loadSamples = async () => {
    try {
      const data = await api.getScanSamples();
      setSamples(data);
    } catch {
      // Non-fatal
    }
  };

  const loadHistory = async () => {
    try {
      const data = await api.getScanHistory();
      setHistory(data);
    } catch {
      // Non-fatal
    }
  };

  const handleSelectSample = (sample: ScanSample) => {
    setContent(sample.content);
    setResult(null);
    setError(null);
  };

  const handleScan = async () => {
    if (!content.trim()) {
      setError('Please provide text or select a demo preset before scanning.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.scanPrompt(content, inputType);
      setResult(res);
      loadHistory();
    } catch (err: any) {
      setError(err.message || 'Scanning failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setContent('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <ScanEye className="w-6 h-6 text-cyan-400" />
            <span>Prompt Injection Scanner</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Analyze untrusted text inputs entering agent context for adversarial overrides, system prompts extraction, and jailbreak directives.
          </p>
        </div>
      </div>

      {/* Probabilistic Disclaimer Notice */}
      <div className="p-4 rounded-xl border border-cyan-900/50 bg-cyan-950/20 text-xs text-cyan-300 flex items-start space-x-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Heuristic Limitations & Trust Model: </span>
          Prompt injection detection is probabilistic and heuristic. Sentinel-X uses transparent, explainable pattern evaluation.
          No scanner detects 100% of adversarial attacks or guarantees zero false positives. Input is treated strictly as untrusted data and never executed.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input Console & Preset Payloads */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider font-semibold">
                Untrusted Input Stream
              </span>
              <div className="flex items-center space-x-2">
                <label className="text-xs text-slate-400 font-mono">Format:</label>
                <select
                  value={inputType}
                  onChange={(e) => setInputType(e.target.value)}
                  className="bg-slate-800 text-xs font-mono text-slate-200 border border-slate-700 rounded px-2 py-1 outline-none focus:border-cyan-500"
                >
                  <option value="text">Plain Text</option>
                  <option value="markdown">Markdown</option>
                  <option value="json">JSON</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={10000}
                placeholder="Paste prompt, user message, or autonomous tool instructions here to evaluate for adversarial injection..."
                rows={8}
                className="w-full bg-[#0a0e17] border border-slate-700/80 rounded-lg p-3 text-sm text-slate-200 font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/80 transition-colors resize-y"
              />
              <div className="absolute bottom-2.5 right-3 text-[11px] font-mono text-slate-400">
                {content.length} / 10,000 chars
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg border border-red-800/80 bg-red-950/30 text-xs text-red-300 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleClear}
                disabled={loading || (!content && !result)}
                className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-mono flex items-center space-x-1.5 disabled:opacity-40 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                onClick={handleScan}
                disabled={loading || !content.trim()}
                className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-mono font-bold flex items-center space-x-2 transition-colors shadow-lg shadow-cyan-950 disabled:opacity-40"
              >
                <ScanEye className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Analyzing Indicators...' : 'Execute Scan'}</span>
              </button>
            </div>
          </div>

          {/* Quick Preset Payloads */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>TEST SAMPLES & PRESET ATTACK PAYLOADS</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {samples.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSample(s)}
                  className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:border-cyan-800/70 hover:bg-cyan-950/20 text-left transition-colors flex flex-col justify-between group"
                >
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                    {s.title}
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[10px] font-mono">
                    <span
                      className={
                        s.category === 'BENIGN'
                          ? 'text-teal-400'
                          : s.category === 'BENIGN_TECHNICAL'
                          ? 'text-cyan-400'
                          : 'text-rose-400'
                      }
                    >
                      {s.category}
                    </span>
                    <span className="text-slate-400">{s.expected}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Scan Results Diagnostic Panel */}
        <div className="space-y-4">
          {result ? (
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono uppercase text-slate-400 font-semibold">
                  Diagnostic Result
                </span>
                <span className="text-[11px] font-mono text-slate-400">{result.scan_id}</span>
              </div>

              {/* Risk Score Dial Card */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  result.risk_score >= 75
                    ? 'border-red-800/80 bg-red-950/30'
                    : result.risk_score >= 50
                    ? 'border-rose-800/80 bg-rose-950/30'
                    : result.risk_score >= 25
                    ? 'border-amber-800/80 bg-amber-950/30'
                    : 'border-emerald-800/80 bg-emerald-950/30'
                }`}
              >
                <div>
                  <div className="text-xs font-mono text-slate-400">CALCULATED RISK</div>
                  <div className="text-3xl font-extrabold font-mono mt-1 text-white">
                    {result.risk_score}
                    <span className="text-sm font-normal text-slate-400">/100</span>
                  </div>
                  <div className="mt-1">
                    <SeverityBadge severity={result.risk_label} size="sm" />
                  </div>
                </div>

                <div className="text-right text-xs font-mono text-slate-400 space-y-1">
                  <div>Band: {result.risk_label}</div>
                  <div>Chars: {result.character_count}</div>
                  <div>Rules Hit: {result.matched_rules.length}</div>
                </div>
              </div>

              {/* Project Defined Score Bands Note */}
              <div className="text-[10px] font-mono text-slate-400 border border-slate-800 rounded p-2 bg-slate-950/50">
                <span className="text-slate-300 font-semibold">Score Bands (Project-defined):</span>
                <br />
                Low: 0–24 | Moderate: 25–49 | High: 50–74 | Critical: 75–100
              </div>

              {/* Explanation */}
              <div>
                <div className="text-xs font-mono text-slate-400 mb-1">ANALYSIS SUMMARY</div>
                <p className="text-xs text-slate-300 bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 leading-relaxed">
                  {result.explanation}
                </p>
              </div>

              {/* Matched Rules Breakdown */}
              <div>
                <div className="text-xs font-mono text-slate-400 mb-2">
                  MATCHED INDICATORS ({result.matched_rules.length})
                </div>

                {result.matched_rules.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {result.matched_rules.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg border border-slate-800 bg-[#0a0e17] text-xs font-mono space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-cyan-300 font-bold">{m.rule_name}</span>
                          <span className="text-amber-400">+{m.weight} pts</span>
                        </div>
                        <div className="text-slate-400 text-[11px]">{m.explanation}</div>
                        <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-red-300 truncate font-mono">
                          Evidence: <span className="text-slate-200">{m.evidence}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg border border-emerald-900/40 bg-emerald-950/20 text-xs text-emerald-300 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>No adversarial signature detected under active rules.</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xl border border-dashed border-slate-800 bg-slate-900/20 text-center text-slate-400 space-y-3">
              <Fingerprint className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-xs font-mono">
                No active scan result. Paste text or pick a preset sample to view real-time rule evaluation and evidence extraction.
              </div>
            </div>
          )}

          {/* Recent Scans Mini Feed */}
          {history.length > 0 && (
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
                <span className="flex items-center space-x-1.5">
                  <History className="w-3.5 h-3.5" />
                  <span>Scan History</span>
                </span>
                <span>{history.length} events</span>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {history.slice(0, 5).map((h) => (
                  <div
                    key={h.id}
                    className="p-2 rounded bg-slate-950/40 border border-slate-800/60 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="truncate max-w-[130px] text-slate-300">{h.summary}</div>
                    <SeverityBadge severity={h.decision || h.severity} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
