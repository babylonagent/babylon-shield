import { describe, expect, it } from 'vitest';
import React from 'react';

describe('Babylon Shield web app', () => {
  it('has React available for the production entrypoint', () => {
    expect(React.version).toMatch(/^19\./);
  });
});
