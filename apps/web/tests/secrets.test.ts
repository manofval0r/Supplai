import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = join(
  fileURLToPath(new URL('.', import.meta.url)),
  '..',
  '..',
  '..',
);

function readEnvExample(relativePath: string) {
  const raw = readFileSync(join(repoRoot, relativePath), 'utf8');
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));
}

function parseEntries(lines: string[]) {
  return lines.map((line) => {
    const separator = line.indexOf('=');
    return {
      key: line.slice(0, separator),
      value: line.slice(separator + 1),
    };
  });
}

describe('web environment example', () => {
  const entries = parseEntries(readEnvExample('apps/web/.env.example'));

  it('documents the public browser variables', () => {
    const keys = entries.map((entry) => entry.key);
    expect(keys).toEqual(expect.arrayContaining(['NEXT_PUBLIC_API_URL']));
  });

  it('contains only NEXT_PUBLIC variables', () => {
    for (const entry of entries) {
      expect(entry.key.startsWith('NEXT_PUBLIC_')).toBe(true);
    }
  });

  it('never carries a server secret or service key', () => {
    for (const entry of entries) {
      expect(entry.value).not.toMatch(
        /secret|service_role|private[_-]?key|eyJ[a-zA-Z0-9_-]{10,}/i,
      );
    }
  });
});

describe('root environment example', () => {
  const entries = parseEntries(readEnvExample('.env.example'));

  it('keeps server secrets as placeholders', () => {
    const secretEntries = entries.filter((entry) =>
      /SECRET|SERVICE|PASSWORD|TOKEN/i.test(entry.key),
    );
    expect(secretEntries.length).toBeGreaterThan(0);
    for (const entry of secretEntries) {
      expect(entry.value).toMatch(/^replace_with_/);
    }
  });

  it('has no committed bearer tokens', () => {
    for (const entry of entries) {
      expect(entry.value).not.toMatch(/eyJ[a-zA-Z0-9_-]{20,}/);
    }
  });
});
