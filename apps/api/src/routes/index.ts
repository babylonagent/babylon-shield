import { z } from 'zod';
import type { FastifyInstance } from 'fastify';
import { BASE_CHAIN_ID, config } from '../config.js';
import { authenticateApiKey, parseApiKeys } from '../services/api-keys.js';
import { checkRateLimit } from '../services/rate-limit.js';
import { healthCheck, simulate } from '../services/rpc-simulator.js';
import { tenderlyConfigured, verifyTenderlyAuth } from '../services/tenderly.js';
import { getThreats, metrics, recordThreat, recordUsageEvent } from '../services/store.js';

const SimulateSchema = z.object({
  chainId: z.number().int().optional().default(BASE_CHAIN_ID),
  from: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  to: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  data: z.string().regex(/^0x[a-fA-F0-9]*$/).optional(),
  value: z.string().regex(/^\d+$/).optional().default('0'),
});

const ThreatSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  threatType: z.string().min(3).max(64),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string().min(5).max(1000),
  evidence: z.record(z.any()).optional(),
});

export async function registerRoutes(app: FastifyInstance) {
  const getKeys = () => parseApiKeys(config.BABYLON_SHIELD_API_KEYS);
  const auth = (req: { headers: Record<string, string | string[] | undefined> }) => authenticateApiKey(req.headers, getKeys());
  const gate = (name: string, reply: any) => {
    const r = checkRateLimit(name, config.BABYLON_SHIELD_RATE_LIMIT_MAX, config.BABYLON_SHIELD_RATE_LIMIT_WINDOW_MS);
    if (!r.ok) return reply.code(429).header('retry-after', String(r.retryAfterSeconds)).send({ error: 'rate_limited', retryAfterSeconds: r.retryAfterSeconds });
  };

  app.get('/health', async () => ({ service: 'babylon-shield', chain: 'base', rpc: await healthCheck(), tenderly: await verifyTenderlyAuth(), tenderlySimulationConfigured: tenderlyConfigured() }));

  app.get('/usage', async (req, reply) => {
    const a = auth(req); if (!a.ok) return reply.code(401).send({ error: a.reason });
    const limited = gate(a.name, reply); if (limited) return limited;
    return { agent: a.name, requests: recordUsageEvent(a.name, '/usage'), service: 'babylon-shield' };
  });

  app.get('/metrics', async (req, reply) => {
    const a = auth(req); if (!a.ok) return reply.code(401).send({ error: a.reason });
    const limited = gate(a.name, reply); if (limited) return limited;
    recordUsageEvent(a.name, '/metrics');
    return { service: 'babylon-shield', ...metrics() };
  });

  app.get('/threats/:address', async (req, reply) => {
    const a = auth(req); if (!a.ok) return reply.code(401).send({ error: a.reason });
    const limited = gate(a.name, reply); if (limited) return limited;
    const address = String((req.params as any).address || '');
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return reply.code(400).send({ error: 'invalid_address' });
    recordUsageEvent(a.name, '/threats/:address');
    return { address: address.toLowerCase(), threats: getThreats(address), service: 'babylon-shield' };
  });

  app.post('/threats/report', async (req, reply) => {
    const a = auth(req); if (!a.ok) return reply.code(401).send({ error: a.reason });
    const limited = gate(a.name, reply); if (limited) return limited;
    const parsed = ThreatSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_threat_report', issues: parsed.error.issues });
    recordThreat({ ...parsed.data, reporter: a.name });
    recordUsageEvent(a.name, '/threats/report');
    return reply.code(201).send({ status: 'recorded', address: parsed.data.address.toLowerCase(), reporter: a.name });
  });

  app.post('/simulate', async (req, reply) => {
    const a = auth(req); if (!a.ok) return reply.code(401).send({ error: a.reason });
    const limited = gate(a.name, reply); if (limited) return limited;
    const parsed = SimulateSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_simulation_request', issues: parsed.error.issues });
    recordUsageEvent(a.name, '/simulate');
    try { return await simulate(parsed.data); } catch (e) { return reply.code(500).send({ error: e instanceof Error ? e.message : String(e) }); }
  });
}
