const counts = new Map<string, number>();
export function recordUsage(name: string): number { const n = (counts.get(name) ?? 0) + 1; counts.set(name, n); return n; }
export function getUsage(name: string): number { return counts.get(name) ?? 0; }
export function resetUsageForTests() { counts.clear(); }
