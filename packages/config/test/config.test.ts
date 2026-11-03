import { describe, expect, it } from 'vitest';

import { loadConfig } from '../src/index.js';

describe('loadConfig', () => {
  it('applies safe local defaults', () => {
    expect(loadConfig({})).toMatchObject({
      NODE_ENV: 'development',
      HOST: '127.0.0.1',
      PORT: 3000,
    });
  });

  it('rejects an invalid port', () => {
    expect(() => loadConfig({ PORT: '70000' })).toThrow();
  });
});
