import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  UserCheck,
  RefreshCw,
  Search,
  ExternalLink,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { ApprovalRequest } from '../types';
import { api } from '../api/client';

interface ApprovalQueueProps {
  onDecisionMade?: () => void;
}

export const ApprovalQueue: React.FC<ApprovalQueueProps> = ({ onDecisionMade }) => {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<string>('PENDING');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Review Modal State
  const [activeRequest, setActiveRequest] = useState<ApprovalRequest | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [reviewReason, setReviewReason] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, [selectedStatus]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const filter = selectedStatus === 'ALL' ? undefined : selectedStatus;
      const [data, pendingData] = await Promise.all([
        api.getApprovals(filter),
        api.getApprovals('PENDING'),
      ]);
      setRequests(data);
      setPendingCount(pendingData.length);
    } catch (err: any) {
      setError(err.message || 'Failed to load approval requests');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (req: ApprovalRequest, defaultDecision: 'APPROVE' | 'REJECT') => {
    setActiveRequest(req);
    setReviewDecision(defaultDecision);
    setReviewReason('');
    setModalError(null);
  };

  const handleSubmitDecision = async () => {
    if (!activeRequest) return;
    if (!reviewReason.trim() || reviewReason.trim().length < 3) {
      setModalError('Please enter a substantive justification reason (min 3 chars).');
      return;
    }

    try {
      setReviewing(true);
      setModalError(null);
      await api.submitApprovalDecision(activeRequest.id, reviewDecision, reviewReason);
      setActiveRequest(null);
      await loadRequests();
      if (onDecisionMade) {
        onDecisionMade();
      }
    } catch (err: any) {
      setModalError(err.message || 'Submission failed');
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <CheckSquare className="w-6 h-6 text-cyan-400" />
            <span>Human Approval Workflow</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Supervisory gate for privileged agent actions requiring explicit human authorization before mock execution.
          </p>
        </div>

        <button
          onClick={loadRequests}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition-colors self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-xl border border-cyan-900/50 bg-cyan-950/20 text-xs text-cyan-300 flex items-start space-x-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Immutable Decision Gate: </span>
          Approval decisions are recorded into the database audit trail with reviewer timestamp and reasoning.
          Decisions cannot be altered from the frontend without server verification. Approved actions remain strictly simulated.
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              selectedStatus === status
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {status}
            {status === 'PENDING' && pendingCount > 0 && selectedStatus !== 'PENDING' && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px]">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-lg border border-red-800 bg-red-950/30 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-3">
        {requests.length > 0 ? (
          requests.map((req) => {
            const timeStr = req.timestamp ? new Date(req.timestamp).toLocaleString() : 'N/A';
            const isPending = req.status === 'PENDING';

            return (
              <div
                key={req.id}
                className={`p-5 rounded-xl border backdrop-blur transition-all ${
                  isPending
                    ? 'border-amber-900/50 bg-slate-900/80 hover:border-amber-700/60'
                    : 'border-slate-800/80 bg-slate-900/40'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs font-bold text-slate-200">{req.id}</span>
                    <StatusBadge status={req.status} size="sm" />
                    <span className="text-xs font-mono text-cyan-400">{req.action_type}</span>
                  </div>

                  <div className="text-xs font-mono text-slate-400 flex items-center space-x-3">
                    <span>Agent: {req.agent_id}</span>
                    <span>•</span>
                    <span>{timeStr}</span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="md:col-span-2 space-y-2">
                    <div>
                      <span className="text-slate-400">Target Resource: </span>
                      <span className="text-slate-200 font-semibold">{req.resource}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Policy Reason: </span>
                      <span className="text-slate-300 font-sans">{req.policy_reason}</span>
                    </div>
                    {req.parameters && Object.keys(req.parameters).length > 0 && (
                      <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 overflow-x-auto">
                        <span className="text-slate-500">Parameters: </span>
                        {JSON.stringify(req.parameters)}
                      </div>
                    )}
                  </div>

                  {/* Actions / Review Status Column */}
                  <div className="flex flex-col justify-center md:items-end space-y-2">
                    {isPending ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleOpenReview(req, 'REJECT')}
                          className="px-3 py-1.5 rounded-lg border border-red-800/60 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-mono transition-colors flex items-center space-x-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => handleOpenReview(req, 'APPROVE')}
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-mono font-bold transition-colors flex items-center space-x-1 shadow-md shadow-emerald-950"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-right space-y-1">
                        <div className="text-[11px] text-slate-400">
                          Reviewed by: <span className="text-cyan-300 font-bold">{req.reviewed_by || 'sec-admin'}</span>
                        </div>
                        <div className="text-[11px] text-slate-300 italic">
                          "{req.reviewer_reason}"
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center text-slate-400 font-mono text-xs border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
            No approval requests found for filter: <span className="text-cyan-300">{selectedStatus}</span>.
            <br />
            Simulate a resource mutation in the Action Firewall to generate an approval request.
          </div>
        )}
      </div>

      {/* Review Modal Dialog */}
      {activeRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg p-6 rounded-2xl border border-slate-700 bg-[#0d1321] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Review Simulated Agent Action</h3>
              </div>
              <button
                onClick={() => setActiveRequest(null)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
              <div>Request ID: <span className="text-cyan-300">{activeRequest.id}</span></div>
              <div>Action: <span className="text-slate-200">{activeRequest.action_type}</span></div>
              <div>Target: <span className="text-slate-200 truncate">{activeRequest.resource}</span></div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Reviewer Verdict</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReviewDecision('APPROVE')}
                  className={`py-2 rounded-lg text-xs font-mono font-bold border transition-colors flex items-center justify-center space-x-1.5 ${
                    reviewDecision === 'APPROVE'
                      ? 'bg-emerald-600 text-slate-950 border-emerald-500 shadow-md shadow-emerald-950'
                      : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>APPROVE ACTION</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewDecision('REJECT')}
                  className={`py-2 rounded-lg text-xs font-mono font-bold border transition-colors flex items-center justify-center space-x-1.5 ${
                    reviewDecision === 'REJECT'
                      ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950'
                      : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>REJECT ACTION</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Mandatory Review Justification
              </label>
              <textarea
                value={reviewReason}
                onChange={(e) => setReviewReason(e.target.value)}
                placeholder="State your security justification for approving or rejecting this action..."
                rows={3}
                className="w-full bg-[#0a0e17] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:border-cyan-500 outline-none resize-none"
              />
            </div>

            {modalError && (
              <div className="p-2.5 rounded bg-red-950/40 border border-red-800/80 text-xs text-red-300">
                {modalError}
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveRequest(null)}
                className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-mono transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitDecision}
                disabled={reviewing || !reviewReason.trim()}
                className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-mono font-bold transition-colors disabled:opacity-40"
              >
                {reviewing ? 'Recording Decision...' : 'Commit Decision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
