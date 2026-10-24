import React, { useState, useEffect } from 'react';
import {
  FileDown,
  Download,
  FileJson,
  CheckCircle,
  ShieldCheck,
  Info,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { api } from '../api/client';

export const ReportCenter: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadPreview();
  }, []);

  const loadPreview = async () => {
    try {
      setLoading(true);
      const data = await api.getConsolidatedReport();
      setReport(data);
    } catch {
      // Non-fatal
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (type: 'consolidated' | 'scans' | 'firewall' | 'audit' | 'simulations') => {
    const url = `/api/reports/${type}?download=true`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentinel_x_${type}_export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setDownloadSuccess(`Export initiated for: ${type.toUpperCase()}`);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <FileDown className="w-6 h-6 text-cyan-400" />
            <span>Security Reporting & Telemetry Export</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Export verified JSON reports containing prompt scan records, firewall verdicts, approval history, and platform metrics.
          </p>
        </div>

        <button
          onClick={loadPreview}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition-colors self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Report State</span>
        </button>
      </div>

      {downloadSuccess && (
        <div className="p-3 rounded-lg border border-emerald-800 bg-emerald-950/40 text-xs font-mono text-emerald-300 flex items-center space-x-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <FileJson className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Consolidated Report</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete security assessment containing summary metrics, active rules, scans, decisions, and approval trails.
            </p>
          </div>
          <button
            onClick={() => handleDownload('consolidated')}
            className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-md shadow-cyan-950"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <FileJson className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Prompt Scans Log</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Raw historical records of evaluated prompts, assigned risk bands, matched rule evidence, and token lengths.
            </p>
          </div>
          <button
            onClick={() => handleDownload('scans')}
            className="w-full py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <FileJson className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Firewall Decisions</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Server-enforced action evaluations, ALLOW / BLOCK decisions, policy names, and simulated target resources.
            </p>
          </div>
          <button
            onClick={() => handleDownload('firewall')}
            className="w-full py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <FileJson className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Threat Simulations</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated threat scenario outcomes, pass/fail verification rates, and evidence records from the Threat Lab.
            </p>
          </div>
          <button
            onClick={() => handleDownload('simulations')}
            className="w-full py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <FileJson className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Full Audit Trail</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete database-backed journal including simulation executions, configuration updates, and human reviewer decisions.
            </p>
          </div>
          <button
            onClick={() => handleDownload('audit')}
            className="w-full py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Live Preview Console */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 font-mono">
            Consolidated Report Live JSON Preview
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            ID: {report?.report_id || 'Generating...'}
          </span>
        </div>

        {report ? (
          <pre className="p-4 rounded-xl bg-[#080c14] border border-slate-800 text-emerald-400 text-xs font-mono max-h-96 overflow-y-auto overflow-x-auto leading-relaxed">
            {JSON.stringify(report, null, 2)}
          </pre>
        ) : (
          <div className="py-12 text-center text-slate-500 font-mono text-xs">
            Loading live report data...
          </div>
        )}
      </div>

      {/* PDF Export Future Roadmap Note */}
      <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/40 text-xs text-slate-400 flex items-start space-x-3">
        <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-300">Export Roadmap & Architecture: </span>
          Full structured JSON serialization is active. Client-side PDF formatting via headless print or server-side Weasyprint
          is documented as an enterprise enhancement in README.md.
        </div>
      </div>
    </div>
  );
};
