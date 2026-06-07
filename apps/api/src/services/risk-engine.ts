import type { ApprovalChange, RiskLevel, RiskWarning } from '../types.js';
export interface RiskOutput { risk: RiskLevel; warnings: RiskWarning[]; summary: string; riskScore: number; }
export function scoreRisks(input: { status: 'success' | 'failed'; approvals: ApprovalChange[] }): RiskOutput {
  const warnings: RiskWarning[] = [];
  if (input.status === 'failed') warnings.push({ code: 'SIMULATION_FAILED', message: 'Simulation failed or reverted', severity: 'high' });
  for (const approval of input.approvals) {
    if (approval.unlimited) warnings.push({ code: 'UNLIMITED_APPROVAL', message: `Unlimited token approval requested for ${approval.spender}`, severity: 'medium' });
    warnings.push({ code: 'UNKNOWN_SPENDER', message: `Spender ${approval.spender} has no local reputation record`, severity: 'low' });
  }
  const weight = { low: 0.15, medium: 0.4, high: 0.75, critical: 1 } as const;
  const riskScore = Math.min(1, warnings.reduce((sum, w) => sum + weight[w.severity], 0));
  const risk: RiskLevel = warnings.some(w => w.severity === 'critical') ? 'blocked' : riskScore >= 0.7 ? 'danger' : riskScore >= 0.3 ? 'warning' : 'safe';
  const summary = warnings.length ? `${risk.toUpperCase()}: ${warnings.map(w => w.code).join(', ')}` : 'Transaction simulated successfully. No risk factors detected.';
  return { risk, warnings, summary, riskScore };
}
