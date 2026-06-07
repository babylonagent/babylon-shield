import { describe, expect, it } from 'vitest';
import { BabylonShieldClient } from './index.js';

describe('BabylonShieldClient', () => {
 it('calls simulate endpoint with bearer auth and exposes findings alias', async () => {
   let seen: any;
   const client = new BabylonShieldClient({
     baseUrl: 'https://shield.local/',
     apiKey: 'k',
     fetchImpl: async (url, init) => {
       seen = { url, init };
       return new Response(JSON.stringify({ chainId: 8453, status: 'success', risk: 'safe', transfers: [], approvals: [], warnings: [], summary: 'ok', riskScore: 0 }), { status: 200 });
     },
   });
   const result = await client.simulate({ from: '0x0000000000000000000000000000000000000001', to: '0x0000000000000000000000000000000000000002' });
   expect(seen.url).toBe('https://shield.local/simulate');
   expect(seen.init.headers.Authorization).toBe('Bearer k');
   expect(result.findings).toEqual([]);
 });

 it('maps reportThreat label/source snippet shape to API threat report payload', async () => {
   let body: any;
   const client = new BabylonShieldClient({
     baseUrl: 'https://shield.local',
     apiKey: 'k',
     fetchImpl: async (_url, init) => {
       body = JSON.parse(String(init?.body));
       return new Response(JSON.stringify({ status: 'recorded' }), { status: 201 });
     },
   });
   await client.reportThreat({
     address: '0x0000000000000000000000000000000000000003',
     label: 'suspicious_spender',
     severity: 'medium',
     source: 'internal-agent',
   });
   expect(body).toEqual({
     address: '0x0000000000000000000000000000000000000003',
     threatType: 'suspicious_spender',
     severity: 'medium',
     description: 'internal-agent: suspicious_spender',
   });
 });
});
