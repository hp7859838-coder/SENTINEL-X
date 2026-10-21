export interface MatchedRuleDetail {
  rule_id: string;
  rule_name: string;
  category: string;
  severity: string;
  weight: number;
  evidence: string;
  explanation: string;
}

export interface ScanResult {
  scan_id: string;
  timestamp: string;
  risk_score: number;
  risk_label: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  matched_rules: MatchedRuleDetail[];
  explanation: string;
  input_preview: string;
  input_type: string;
  character_count: number;
  confidence_disclaimer: string;
}

export interface ScanSample {
  id: string;
  title: string;
  category: string;
  expected: string;
  content: string;
}

export interface ActionEvaluateResponse {
  decision_id: string;
  timestamp: string;
  action_type: string;
  resource: string;
  parameters: Record<string, any>;
  decision: 'ALLOW' | 'BLOCK' | 'REQUIRE_APPROVAL';
  reason: string;
  requires_approval: boolean;
  approval_request_id?: string;
  policy_name: string;
  is_simulated: boolean;
  disclaimer: string;
}

export interface ActionPreset {
  action_type: string;
  name: string;
  resource: string;
  parameters: Record<string, any>;
  expected_policy: string;
  expected_decision: string;
  description: string;
}

export interface ApprovalRequest {
  id: string;
  timestamp: string;
  action_type: string;
  resource: string;
  parameters: Record<string, any>;
  agent_id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  policy_reason: string;
  reviewer_decision?: string;
  reviewer_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  category: 'SCANNER' | 'FIREWALL';
  sample_input?: string;
  sample_action?: Record<string, any>;
  expected_outcome: string;
  expected_decision: string;
}

export interface SimulationResult {
  scenario_id: string;
  scenario_name: string;
  category: string;
  timestamp: string;
  expected_outcome: string;
  actual_outcome: string;
  passed: boolean;
  details: Record<string, any>;
}

export interface BatchSimulationResponse {
  timestamp: string;
  total_scenarios: number;
  passed_count: number;
  failed_count: number;
  success_rate: number;
  results: SimulationResult[];
}

export interface DetectionRule {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  score_weight: number;
  pattern: string;
  is_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EventLog {
  id: string;
  timestamp: string;
  event_type: string;
  summary: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'INFO';
  risk_score?: number;
  decision?: string;
  reason: string;
  details: Record<string, any>;
  related_id?: string;
}

export interface SeverityDistribution {
  low: number;
  moderate: number;
  high: number;
  critical: number;
  info: number;
}

export interface DashboardMetrics {
  total_scanned_events: number;
  flagged_inputs: number;
  high_and_critical_findings: number;
  allowed_actions: number;
  blocked_actions: number;
  pending_approval_requests: number;
  total_audit_events: number;
  severity_distribution: SeverityDistribution;
  recent_events: EventLog[];
  latest_decisions: any[];
}
