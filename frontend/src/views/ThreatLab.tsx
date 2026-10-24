import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Play,
  PlaySquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  RefreshCw,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { SimulationScenario, SimulationResult, BatchSimulationResponse } from '../types';
import { api } from '../api/client';

interface ThreatLabProps {
  onSimulationComplete?: () => void;
}

export const ThreatLab: React.FC<ThreatLabProps> = ({ onSimulationComplete }) => {
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [resultsMap, setResultsMap] = useState<Record<string, SimulationResult>>({});
  const [runningId, setRunningId] = useState<string | null>(null);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchSummary, setBatchSummary] = useState<BatchSimulationResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      setLoading(true);
      const data = await api.getSimulationScenarios();
      setScenarios(data);
    } catch {
      // Non-fatal
    } finally {
      setLoading(false);
    }
  };

  const handleRunSingle = async (scenarioId: string) => {
    try {
      setRunningId(scenarioId);
      const res = await api.runSingleScenario(scenarioId);
      setResultsMap((prev) => ({ ...prev, [scenarioId]: res }));
      if (onSimulationComplete) {
        onSimulationComplete();
      }
    } catch {
      // Handle error
    } finally {
      setRunningId(null);
    }
  };

  const handleRunAll = async () => {
    try {
      setBatchRunning(true);
      const batch = await api.runBatchSimulation();
      setBatchSummary(batch);
      const newMap: Record<string, SimulationResult> = {};
      batch.results.forEach((r) => {
        newMap[r.scenario_id] = r;
      });
      setResultsMap(newMap);
      if (onSimulationComplete) {
        onSimulationComplete();
      }
    } catch {
      // Handle error
    } finally {
      setBatchRunning(false);
    }
  };

  const totalExecuted = Object.keys(resultsMap).length;
  const passedCount = Object.values(resultsMap).filter((r) => r.passed).length;
  const calculatedRate = totalExecuted > 0 ? Math.round((passedCount / totalExecuted) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <FlaskConical className="w-6 h-6 text-cyan-400" />
            <span>Threat Simulation Lab</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Automated test suite with 8 verified attack vectors and benign control cases to validate scanner and firewall efficacy.
          </p>
        </div>

        <button
          onClick={handleRunAll}
          disabled={batchRunning || runningId !== null}
          className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-mono font-bold flex items-center space-x-2 transition-colors shadow-lg shadow-cyan-950 disabled:opacity-40 self-start"
        >
          <PlaySquare className={`w-4 h-4 ${batchRunning ? 'animate-spin' : ''}`} />
          <span>{batchRunning ? 'Executing Demo Suite...' : 'Run Full Demo Suite (8 Scenarios)'}</span>
        </button>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-xl border border-cyan-900/50 bg-cyan-950/20 text-xs text-cyan-300 flex items-start space-x-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Safe Synthetic Sandbox: </span>
          All scenarios evaluate against synthetic demo records and policy rules without accessing external systems,
          untrusted live networks, or executing malicious code.
        </div>
      </div>

      {/* Execution Progress Bar */}
      {totalExecuted > 0 && (
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-semibold">SUITE VALIDATION SCORE</span>
            <span className="text-cyan-400 font-bold">
              {passedCount} / {totalExecuted} PASSED ({calculatedRate}%)
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-500 ${
                calculatedRate === 100
                  ? 'bg-emerald-500 shadow-md shadow-emerald-500/50'
                  : calculatedRate >= 75
                  ? 'bg-cyan-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${calculatedRate}%` }}
            />
          </div>
        </div>
      )}

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map((sc) => {
          const res = resultsMap[sc.id];
          const isRunning = runningId === sc.id;

          return (
            <div
              key={sc.id}
              className={`p-5 rounded-xl border backdrop-blur transition-all flex flex-col justify-between ${
                res
                  ? res.passed
                    ? 'border-emerald-800/60 bg-slate-900/80'
                    : 'border-red-800/60 bg-slate-900/80'
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">{sc.id}</span>
                    <span className="text-slate-300 font-semibold text-xs">{sc.name}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    {sc.category}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{sc.description}</p>

                {/* Sample Payload Preview */}
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Tested Vector:</div>
                  <div className="text-slate-300 line-clamp-2">
                    {sc.category === 'SCANNER' ? sc.sample_input : JSON.stringify(sc.sample_action)}
                  </div>
                </div>

                {/* Expected vs Actual */}
                <div className="space-y-1 text-xs font-mono">
                  <div className="text-slate-400">
                    Expected: <span className="text-slate-200">{sc.expected_outcome}</span>
                  </div>
                  {res && (
                    <div>
                      <div className="text-slate-400">
                        Actual: <span className="text-cyan-300 font-bold">{res.actual_outcome}</span>
                      </div>
                      {!res.passed && (
                        <div className="mt-1.5 p-2 rounded bg-red-950/40 border border-red-800/60 text-red-300 text-[11px] leading-relaxed">
                          <span className="font-semibold text-red-200">Mismatch Explanation: </span>
                          Evaluation result did not satisfy criteria ({sc.expected_outcome}). Received: {res.actual_outcome}.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Control & Pass / Fail Badge */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  {res ? (
                    <div className="flex items-center space-x-1.5 font-mono text-xs font-bold">
                      {res.passed ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400">VERIFIED PASS</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-400" />
                          <span className="text-red-400">FAILED</span>
                        </>
                      )}
                    </div>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-500">Not executed yet</span>
                  )}
                </div>

                <button
                  onClick={() => handleRunSingle(sc.id)}
                  disabled={isRunning || batchRunning}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center space-x-1.5 transition-colors disabled:opacity-40"
                >
                  <Play className={`w-3 h-3 ${isRunning ? 'animate-spin' : ''}`} />
                  <span>{isRunning ? 'Running...' : 'Run Scenario'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
