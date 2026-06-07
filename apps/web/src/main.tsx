import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const simulateSnippet = `import { BabylonShieldClient } from "@babylon/shield-sdk";

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
}`;

const threatSnippet = `await shield.reportThreat({
  address: "0x...",
  label: "suspicious_spender",
  severity: "medium",
  source: "internal-agent",
  evidence: {
    txHash: "0x...",
    reason: "unexpected approval target"
  }
});`;

const stats = [
  { label: 'Chain focus', value: 'Base', note: 'Mainnet pre-transaction checks' },
  { label: 'API surface', value: '5', note: 'Health, simulate, usage, metrics, threats' },
  { label: 'Runtime mode', value: 'VPS', note: 'Keys stay outside public deploys' },
];

const flow = [
  'Transaction submitted by wallet, agent, or dApp',
  'Shield simulates call and decodes approval intent',
  'Risk engine scores warnings before signature or execution',
  'Client blocks, warns, or proceeds with structured evidence',
];

const endpoints = [
  { method: 'GET', path: '/health', text: 'Public service and Base RPC readiness.' },
  { method: 'POST', path: '/simulate', text: 'Authenticated pre-transaction simulation.' },
  { method: 'POST', path: '/threats/report', text: 'Submit verified threat intelligence.' },
  { method: 'GET', path: '/threats/:address', text: 'Fetch address-level threat reports.' },
  { method: 'GET', path: '/metrics', text: 'Authenticated service usage summary.' },
];

const verdictStates = [
  {
    risk: 'safe',
    tone: 'safe',
    width: '18%',
    findings: ['No approval change detected', 'Known counterparty profile', 'Transaction cleared for execution'],
  },
  {
    risk: 'warning',
    tone: 'warning',
    width: '64%',
    findings: ['Unlimited approval detected', 'Unknown spender reputation', 'Review before signing'],
  },
  {
    risk: 'danger',
    tone: 'danger',
    width: '82%',
    findings: ['High-risk spender pattern', 'Approval exceeds expected scope', 'Agent policy should halt'],
  },
  {
    risk: 'blocked',
    tone: 'blocked',
    width: '100%',
    findings: ['Threat intelligence match', 'Known malicious approval target', 'Execution blocked by policy'],
  },
];

function App() {
  const [verdictIndex, setVerdictIndex] = useState(1);
  const verdict = verdictStates[verdictIndex];

  useEffect(() => {
    const id = window.setInterval(() => {
      setVerdictIndex((current) => (current + 1) % verdictStates.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Babylon Shield home">Babylon Shield</a>
        <nav aria-label="Primary navigation">
          <a href="#sdk">SDK</a>
          <a href="#endpoints">API</a>
          <a href="https://github.com/babylonagent" target="_blank" rel="noreferrer">Git</a>
          <a href="https://x.com/babylon_agent" target="_blank" rel="noreferrer">X</a>
        </nav>
      </header>
      <main id="top">
      <section className="hero section-grid">
        <div className="hero-copy">
          <p className="eyebrow">BABYLON SHIELD / BASE SECURITY LAYER</p>
          <h1>Pre-transaction defense for agents, wallets, and dApps.</h1>
          <p className="lede">
            Babylon Shield checks intent before execution: simulate the call, decode approvals,
            score risk, and return structured findings that software can act on.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#sdk">Use the SDK</a>
            <a className="button secondary" href="#endpoints">View endpoints</a>
          </div>
        </div>
        <aside className={`terminal-card verdict-${verdict.tone}`} aria-label="Risk panel preview">
          <div className="terminal-top"><span></span><span></span><span></span></div>
          <p className="mono-label">SIMULATION RESULT</p>
          <div className="risk-row">
            <span>risk</span>
            <strong key={verdict.risk}>{verdict.risk}</strong>
          </div>
          <div className="risk-meter" aria-hidden="true"><i style={{ width: verdict.width }} /></div>
          <ul key={`${verdict.risk}-findings`} className="findings-list">
            {verdict.findings.map((finding) => <li key={finding}>{finding}</li>)}
          </ul>
        </aside>
      </section>

      <section className="stats" aria-label="Product facts">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <p className="mono-label">{stat.label}</p>
            <strong>{stat.value}</strong>
            <span>{stat.note}</span>
          </article>
        ))}
      </section>

      <section className="section-grid" id="sdk">
        <div>
          <p className="eyebrow">SDK-FIRST INTEGRATION</p>
          <h2>One client for simulation and threat reporting.</h2>
          <p>
            The web page mirrors the SDK contract: call <code>simulate</code> before a transaction,
            then submit verified threat intel through <code>reportThreat</code> when a system finds repeatable evidence.
          </p>
        </div>
        <div className="code-stack">
          <pre><code>{simulateSnippet}</code></pre>
          <pre><code>{threatSnippet}</code></pre>
        </div>
      </section>

      <section className="workflow">
        <p className="eyebrow">CONTROL FLOW</p>
        <h2>From intent to verdict.</h2>
        <div className="flow-grid">
          {flow.map((item, index) => (
            <article className="flow-card" key={item}>
              <span className="step">0{index + 1}</span>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-grid" id="endpoints">
        <div>
          <p className="eyebrow">API SURFACE</p>
          <h2>Small, explicit, machine-readable.</h2>
          <p>
            Shield keeps the production API compact: authenticated calls for sensitive data,
            public health checks for uptime monitoring, and clear JSON results for agents.
          </p>
        </div>
        <div className="endpoint-list">
          {endpoints.map((endpoint) => (
            <article className="endpoint" key={endpoint.path}>
              <div><span>{endpoint.method}</span><strong>{endpoint.path}</strong></div>
              <p>{endpoint.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cta">
        <p className="eyebrow">BUILT FOR EXECUTION GATES</p>
        <h2>Give agents a reason to stop before signing.</h2>
        <p>
          Connect Shield to wallets, automation runners, and monitoring flows that need a simple verdict:
          safe, warning, danger, or blocked.
        </p>
        <a className="button primary" href="https://shield.babylon-agent.com/health">Check service health</a>
      </section>
    </main>
      <footer className="site-footer">
        <span>Babylon Shield</span>
        <nav aria-label="Footer links">
          <a href="https://github.com/babylonagent" target="_blank" rel="noreferrer">Git</a>
          <a href="https://x.com/babylon_agent" target="_blank" rel="noreferrer">X</a>
        </nav>
      </footer>
    </>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
