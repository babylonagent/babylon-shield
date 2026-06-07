import { JsonRpcProvider } from 'ethers';
import { BASE_CHAIN_ID, config } from '../config.js';
import { decodeApprovalCall } from '../decoders/erc20.js';
import { scoreRisks } from './risk-engine.js';
import { simulateWithTenderly, tenderlyConfigured } from './tenderly.js';
import type { SimulateRequest, SimulateResponse } from '../types.js';
const provider = new JsonRpcProvider(config.BABYLON_SHIELD_BASE_RPC_HTTP, BASE_CHAIN_ID);
export async function healthCheck() { const [blockNumber, network] = await Promise.all([provider.getBlockNumber(), provider.getNetwork()]); return { ok: Number(network.chainId) === BASE_CHAIN_ID, chainId: Number(network.chainId), blockNumber }; }
export async function simulate(req: SimulateRequest): Promise<SimulateResponse> {
  const chainId = req.chainId ?? BASE_CHAIN_ID; if (chainId !== BASE_CHAIN_ID) throw new Error(`Unsupported chainId ${chainId}. Babylon Shield supports Base only.`);
  const tx = { from: req.from, to: req.to, data: req.data ?? '0x', value: req.value ? BigInt(req.value) : 0n };
  const blockNumber = await provider.getBlockNumber(); let status: 'success' | 'failed' = 'success'; let gasUsed: string | undefined; let raw: unknown;
  try { if (tenderlyConfigured()) { const t = await simulateWithTenderly({ ...req, chainId }); status = t.transaction?.status === false ? 'failed' : 'success'; gasUsed = t.transaction?.gas_used?.toString(); raw = { provider: 'tenderly', tenderlyStatus: t.transaction?.status, tenderlyBlockNumber: t.transaction?.block_number }; }
    else { const [callResult, gas] = await Promise.all([provider.call(tx), provider.estimateGas(tx)]); gasUsed = gas.toString(); raw = { provider: 'rpc', callResult }; }
  } catch (e) { status = 'failed'; raw = e instanceof Error ? { name: e.name, message: e.message } : { message: String(e) }; }
  const approval = decodeApprovalCall({ from: req.from, to: req.to, data: req.data }); const approvals = approval ? [approval] : []; const scored = scoreRisks({ status, approvals });
  return { chainId, status, risk: scored.risk, gasUsed, blockNumber, transfers: [], approvals, warnings: scored.warnings, findings: scored.warnings, summary: scored.summary, riskScore: scored.riskScore, raw };
}
