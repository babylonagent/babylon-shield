import { config } from '../config.js';
import type { SimulateRequest } from '../types.js';

export function tenderlyConfigured(): boolean { return Boolean(config.BABYLON_SHIELD_TENDERLY_API_KEY && config.BABYLON_SHIELD_TENDERLY_ACCOUNT && config.BABYLON_SHIELD_TENDERLY_PROJECT); }
export async function verifyTenderlyAuth(): Promise<{ ok: boolean; detail: string }> {
  if (!config.BABYLON_SHIELD_TENDERLY_API_KEY) return { ok: false, detail: 'Tenderly API key is not configured' };
  const res = await fetch('https://api.tenderly.co/api/v1/user', { headers: { 'X-Access-Key': config.BABYLON_SHIELD_TENDERLY_API_KEY } });
  return { ok: res.ok, detail: `Tenderly /user returned HTTP ${res.status}` };
}
export async function simulateWithTenderly(req: SimulateRequest & { chainId: number }) {
  if (!tenderlyConfigured()) throw new Error('Tenderly is not fully configured');
  const url = `https://api.tenderly.co/api/v1/account/${config.BABYLON_SHIELD_TENDERLY_ACCOUNT}/project/${config.BABYLON_SHIELD_TENDERLY_PROJECT}/simulate`;
  const res = await fetch(url, { method: 'POST', headers: { 'X-Access-Key': config.BABYLON_SHIELD_TENDERLY_API_KEY!, 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ network_id: String(req.chainId), from: req.from, to: req.to, input: req.data ?? '0x', value: req.value ?? '0', save: false, save_if_fails: false, simulation_type: 'quick' }) });
  const text = await res.text(); const json = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(`Tenderly simulation HTTP ${res.status}: ${text.slice(0, 240)}`);
  return json;
}
