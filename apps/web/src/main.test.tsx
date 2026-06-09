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

  it('uses the uploaded Shield artwork as a fixed background', () => {
    const styles = readFileSync(resolve(__dirname, 'styles.css'), 'utf8');
    expect(styles).toContain("url('/babylon-shield-bg.jpg') center / cover fixed no-repeat");
  });

  it('renders the Shield logo in the header and configures the favicon', () => {
    const source = readFileSync(resolve(__dirname, 'main.tsx'), 'utf8');
    const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
    expect(source).toContain('src="/shield_logo_white.png"');
    expect(html).toContain('href="/shield_logo_black.png"');
  });
});
