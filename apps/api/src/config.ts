import 'dotenv/config';
import { z } from 'zod';

const ConfigSchema = z.object({
  BABYLON_SHIELD_TENDERLY_API_KEY: z.string().optional(),
  BABYLON_SHIELD_TENDERLY_ACCOUNT: z.string().default('babylonagent'),
  BABYLON_SHIELD_TENDERLY_PROJECT: z.string().default('project'),
  BABYLON_SHIELD_BASE_RPC_HTTP: z.string().url(),
  BABYLON_SHIELD_PORT: z.coerce.number().int().positive().default(8787),
  BABYLON_SHIELD_API_KEYS: z.string().optional(),
  BABYLON_SHIELD_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(60),
  BABYLON_SHIELD_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  BABYLON_SHIELD_DB_PATH: z.string().default('/var/lib/babylon-shield/shield.db'),
});

export const config = ConfigSchema.parse(process.env);
export const BASE_CHAIN_ID = 8453;
