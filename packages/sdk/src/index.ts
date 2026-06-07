export type Hex = `0x${string}`;
export type RiskLevel = 'safe' | 'warning' | 'danger' | 'blocked';
export type ThreatSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ShieldClientOptions { baseUrl: string; apiKey?: string; fetchImpl?: typeof fetch; }
export interface SimulateRequest { chainId?: number; from: Hex; to: Hex; data?: Hex; value?: string; }
export interface RiskWarning { code: string; message: string; severity: ThreatSeverity; }
export interface SimulateResponse {
  chainId: number;
  status: 'success' | 'failed';
  risk: RiskLevel;
  gasUsed?: string;
  blockNumber?: number;
  transfers: unknown[];
  approvals: unknown[];
  warnings: RiskWarning[];
  findings: RiskWarning[];
  summary: string;
  riskScore: number;
  raw?: unknown;
}
export interface ThreatReportRequest {
  address: Hex;
  threatType?: string;
  label?: string;
  severity: ThreatSeverity;
  description?: string;
  source?: string;
  evidence?: Record<string, unknown>;
}

export class BabylonShieldError extends Error {
  constructor(message: string, readonly status: number, readonly body: string) {
    super(message);
    this.name = 'BabylonShieldError';
  }
}

export class BabylonShieldClient {
  private fetchImpl: typeof fetch;

  constructor(private options: ShieldClientOptions) {
    if (!options.baseUrl) throw new Error('baseUrl is required');
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  private url(path: string) { return `${this.options.baseUrl.replace(/\/$/, '')}${path}`; }

  private headers() {
    const h: Record<string,string> = { 'Content-Type': 'application/json' };
    if (this.options.apiKey) h.Authorization = `Bearer ${this.options.apiKey}`;
    return h;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await this.fetchImpl(this.url(path), {
      ...init,
      headers: { ...this.headers(), ...(init.headers as Record<string,string> | undefined) },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new BabylonShieldError(`Babylon Shield HTTP ${res.status}: ${body}`, res.status, body);
    }
    return res.json() as Promise<T>;
  }

  health() { return this.request('/health'); }
  usage() { return this.request('/usage'); }
  metrics() { return this.request('/metrics'); }

  async simulate(request: SimulateRequest) {
    const result = await this.request<SimulateResponse>('/simulate', { method: 'POST', body: JSON.stringify(request) });
    return { ...result, findings: result.findings ?? result.warnings ?? [] };
  }

  reportThreat(request: ThreatReportRequest) {
    const threatType = request.threatType ?? request.label;
    if (!threatType) throw new Error('reportThreat requires threatType or label');
    const description = request.description ?? ([request.source, threatType].filter(Boolean).join(': ') || threatType);
    return this.request('/threats/report', {
      method: 'POST',
      body: JSON.stringify({
        address: request.address,
        threatType,
        severity: request.severity,
        description,
        evidence: request.evidence,
      }),
    });
  }

  getThreats(address: Hex) { return this.request(`/threats/${address}`); }
  isRisky(result: Pick<SimulateResponse, 'risk'>) { return result.risk === 'danger' || result.risk === 'blocked'; }
}

export { BabylonShieldClient as ShieldClient };
