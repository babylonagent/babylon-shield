export type Hex = `0x${string}`;
export type RiskLevel = 'safe' | 'warning' | 'danger' | 'blocked';
export type WarningSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SimulateRequest { chainId?: number; from: string; to: string; data?: string; value?: string; }
export interface ApprovalChange { token: string; owner: string; spender: string; amount: string; unlimited: boolean; }
export interface TokenTransfer { token: string; from: string; to: string; amount: string; }
export interface RiskWarning { code: string; message: string; severity: WarningSeverity; }
export interface SimulateResponse {
  chainId: number;
  status: 'success' | 'failed';
  risk: RiskLevel;
  gasUsed?: string;
  blockNumber?: number;
  transfers: TokenTransfer[];
  approvals: ApprovalChange[];
  warnings: RiskWarning[];
  findings: RiskWarning[];
  summary: string;
  riskScore: number;
  raw?: unknown;
}
