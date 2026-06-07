# Babylon Shield

Base-first pre-transaction security API, SDK, and public beta webpage for agents, wallets, and dApps.

## Status

Public beta. The SDK, API contract, examples, and webpage are public so builders can integrate and test. Production secrets and runtime keys stay outside Git.

## What Shield does

- Simulates transaction intent before execution.
- Decodes ERC-20 approval calls.
- Scores basic risk signals such as unlimited approvals and unknown spenders.
- Returns machine-readable verdicts: `safe`, `warning`, `danger`, or `blocked`.
- Accepts verified threat reports for address-level intelligence.

## Workspaces

```text
apps/api      Fastify API service
apps/web      Public Shield landing page
packages/sdk  TypeScript SDK
```

## Public webpage

Live beta page: https://shield.babylon-agent.com

## SDK example

```ts
import { BabylonShieldClient } from "@babylon/shield-sdk";

const shield = new BabylonShieldClient({
  baseUrl: "https://shield.babylon-agent.com",
  apiKey: process.env.SHIELD_API_KEY
});

const result = await shield.simulate({
  from: "0x...",
  to: "0x...",
  data: "0x...",
  value: "0"
});

if (result.risk !== "safe") {
  console.log(result.findings);
}
```

## API endpoints

- `GET /health`
- `POST /simulate`
- `GET /usage`
- `GET /metrics`
- `GET /threats/:address`
- `POST /threats/report`

## Local development

```bash
npm install
npm run build
npm test
npm --workspace apps/web run dev
npm --workspace apps/api run dev
```

## Environment

Copy `.env.example` and fill runtime values on the server only. Do not commit real API keys.

```bash
cp .env.example .env
```

## Security policy

- No production secrets in Git.
- No production secrets in client bundles.
- Runtime keys must live only in the server environment.

## Beta monetization plan

Shield is open during beta to collect usage stats, integration feedback, and risk data. Paid access can be added later through x402 and API tiers once traffic and simulation cost data are available.
