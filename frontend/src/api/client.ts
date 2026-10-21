import {
  DashboardMetrics,
  ScanResult,
  ScanSample,
  ActionEvaluateResponse,
  ActionPreset,
  ApprovalRequest,
  SimulationScenario,
  SimulationResult,
  BatchSimulationResponse,
  DetectionRule,
  EventLog,
} from '../types';

const API_BASE = '/api';

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        errorMessage = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
      } else if (errorJson.message) {
        errorMessage = errorJson.message;
      }
    } catch {
      // Keep default message
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  // Dashboard
  getDashboardStats: () => apiFetch<DashboardMetrics>('/dashboard/stats'),

  // Scanner
  scanPrompt: (content: string, inputType: string = 'text') =>
    apiFetch<ScanResult>('/scan', {
      method: 'POST',
      body: JSON.stringify({ content, input_type: inputType }),
    }),
  getScanSamples: () => apiFetch<ScanSample[]>('/scan/samples'),
  getScanHistory: () => apiFetch<EventLog[]>('/scan/history'),

  // Action Firewall
  evaluateAction: (action_type: string, resource: string, parameters: Record<string, any> = {}, agent_id: string = 'simulated-agent-01') =>
    apiFetch<ActionEvaluateResponse>('/firewall/evaluate', {
      method: 'POST',
      body: JSON.stringify({ action_type, resource, parameters, agent_id }),
    }),
  getActionCatalog: () => apiFetch<ActionPreset[]>('/firewall/actions'),

  // Approvals
  getApprovals: (status?: string) =>
    apiFetch<ApprovalRequest[]>(`/approvals${status ? `?status=${status}` : ''}`),
  getApprovalDetail: (id: string) => apiFetch<ApprovalRequest>(`/approvals/${id}`),
  submitApprovalDecision: (id: string, decision: 'APPROVE' | 'REJECT', reason: string, reviewer: string = 'sec-admin') =>
    apiFetch<ApprovalRequest>(`/approvals/${id}/decision`, {
      method: 'POST',
      body: JSON.stringify({ decision, reason, reviewer }),
    }),

  // Simulations
  getSimulationScenarios: () => apiFetch<SimulationScenario[]>('/simulation/scenarios'),
  runSingleScenario: (id: string) =>
    apiFetch<SimulationResult>(`/simulation/run/${id}`, { method: 'POST' }),
  runBatchSimulation: () =>
    apiFetch<BatchSimulationResponse>('/simulation/run-all', { method: 'POST' }),

  // Rules
  getRules: (category?: string, enabled?: boolean) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (enabled !== undefined) params.append('enabled', String(enabled));
    const qs = params.toString();
    return apiFetch<DetectionRule[]>(`/rules${qs ? `?${qs}` : ''}`);
  },
  updateRule: (id: string, updates: { is_enabled?: boolean; score_weight?: number; severity?: string }) =>
    apiFetch<DetectionRule>(`/rules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  resetRules: () => apiFetch<DetectionRule[]>('/rules/reset', { method: 'POST' }),

  // Audit Events
  getEvents: (params: { query?: string; event_type?: string; severity?: string; decision?: string; limit?: number; offset?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.query) qs.append('query', params.query);
    if (params.event_type) qs.append('event_type', params.event_type);
    if (params.severity) qs.append('severity', params.severity);
    if (params.decision) qs.append('decision', params.decision);
    if (params.limit) qs.append('limit', String(params.limit));
    if (params.offset) qs.append('offset', String(params.offset));
    return apiFetch<{ total: number; limit: number; offset: number; events: EventLog[] }>(`/events?${qs.toString()}`);
  },
  getEventDetail: (id: string) => apiFetch<EventLog>(`/events/${id}`),

  // Reports
  getConsolidatedReport: () => apiFetch<any>('/reports/consolidated'),
};
