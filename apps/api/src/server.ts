import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config.js';
import { registerRoutes } from './routes/index.js';
export async function buildServer() { const app = Fastify({ logger: true }); await app.register(cors, { origin: false }); await registerRoutes(app); return app; }
if (import.meta.url === `file://${process.argv[1]}`) { const app = await buildServer(); await app.listen({ port: config.BABYLON_SHIELD_PORT, host: '0.0.0.0' }); }
