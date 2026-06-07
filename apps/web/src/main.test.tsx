import { describe, expect, it } from 'vitest';
import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Babylon Shield web app', () => {
  it('has React available for the production entrypoint', () => {
    expect(React.version).toMatch(/^19\./);
  });

  it('defines all animated risk states', () => {
    const source = readFileSync(resolve(__dirname, 'main.tsx'), 'utf8');
    for (const risk of ['safe', 'warning', 'danger', 'blocked']) {
      expect(source).toContain(`risk: '${risk}'`);
      expect(source).toContain('verdict-${verdict.tone}');
    }
  });
});
