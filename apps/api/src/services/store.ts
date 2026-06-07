import Database = require('better-sqlite3');
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { config } from '../config.js';

mkdirSync(dirname(config.BABYLON_SHIELD_DB_PATH), { recursive: true });
const db = new Database(config.BABYLON_SHIELD_DB_PATH);
db.pragma('journal_mode = WAL');

type CountRow = { count: number };

db.exec(`
CREATE TABLE IF NOT EXISTS usage_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent TEXT NOT NULL,
  route TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_usage_agent ON usage_events(agent);
CREATE INDEX IF NOT EXISTS idx_usage_created ON usage_events(created_at);
CREATE TABLE IF NOT EXISTS threat_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  address TEXT NOT NULL,
  threat_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  description TEXT NOT NULL,
  reporter TEXT NOT NULL,
  evidence TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_threat_address ON threat_reports(address);
`);

export function recordUsageEvent(agent: string, route: string): number {
  db.prepare('INSERT INTO usage_events(agent, route) VALUES (?, ?)').run(agent, route);
  return Number((db.prepare('SELECT COUNT(*) as count FROM usage_events WHERE agent = ?').get(agent) as CountRow).count);
}

export function usageSummary() {
  return db.prepare('SELECT agent, COUNT(*) as requests FROM usage_events GROUP BY agent ORDER BY agent').all();
}

export function metrics() {
  const totalRequests = Number((db.prepare('SELECT COUNT(*) as count FROM usage_events').get() as CountRow).count);
  const totalThreatReports = Number((db.prepare('SELECT COUNT(*) as count FROM threat_reports').get() as CountRow).count);
  return { totalRequests, totalThreatReports, agents: usageSummary() };
}

export function recordThreat(input: { address: string; threatType: string; severity: string; description: string; reporter: string; evidence?: unknown }) {
  db.prepare('INSERT INTO threat_reports(address, threat_type, severity, description, reporter, evidence) VALUES (?, ?, ?, ?, ?, ?)')
    .run(input.address.toLowerCase(), input.threatType, input.severity, input.description, input.reporter, input.evidence ? JSON.stringify(input.evidence) : null);
}

export function getThreats(address: string) {
  return db.prepare('SELECT id, address, threat_type as threatType, severity, description, reporter, evidence, created_at as createdAt FROM threat_reports WHERE address = ? ORDER BY id DESC LIMIT 25')
    .all(address.toLowerCase())
    .map((row: any) => ({ ...row, evidence: row.evidence ? JSON.parse(row.evidence) : undefined }));
}
