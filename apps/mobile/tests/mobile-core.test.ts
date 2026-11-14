import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  defaultChatQuickPrompts,
  resolveSupplaiAssistantQuery,
} from '@supplai/contracts';

const mobileRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..');

describe('mobile app.json & EAS configuration', () => {
  const appJson = JSON.parse(
    readFileSync(join(mobileRoot, 'app.json'), 'utf8'),
  ) as {
    expo: {
      android: { package: string };
      plugins: string[];
      runtimeVersion: { policy: string };
      updates: { url: string };
    };
  };

  it('preserves R8 ProGuard plugin and Android package ID', () => {
    expect(appJson.expo.android.package).toBe('com.supplai.app');
    expect(appJson.expo.plugins).toContain('./plugins/withProguardRules.js');
  });

  it('has EAS OTA updates configured with appVersion runtime policy', () => {
    expect(appJson.expo.updates.url).toMatch(/^https:\/\/u\.expo\.dev\//);
    expect(appJson.expo.runtimeVersion.policy).toBe('appVersion');
  });
});

describe('mobile ProGuard config plugin', () => {
  it('appends expo-gl and ExpoView keep rules to proguard-rules.pro', async () => {
    const tempDir = join(tmpdir(), `supplai-proguard-${Date.now()}`);
    const appDir = join(tempDir, 'app');
    mkdirSync(appDir, { recursive: true });
    const proguardFile = join(appDir, 'proguard-rules.pro');
    writeFileSync(proguardFile, '# base rules\n', 'utf8');

    const pluginModule =
      (await import('../plugins/withProguardRules.js')) as unknown as {
        default: (cfg: Record<string, unknown>) => Record<string, unknown>;
      };
    const plugin = pluginModule.default;
    const config = plugin({ mods: {} }) as {
      mods: {
        android: {
          dangerous: (c: {
            modRequest: { platformProjectRoot: string };
          }) => Promise<unknown>;
        };
      };
    };

    await config.mods.android.dangerous({
      modRequest: { platformProjectRoot: tempDir },
    });

    const updated = readFileSync(proguardFile, 'utf8');
    expect(updated).toContain('-keep class expo.modules.gl.** { *; }');
    expect(updated).toContain('extends expo.modules.kotlin.views.ExpoView');

    if (existsSync(tempDir)) rmSync(tempDir, { recursive: true, force: true });
  });
});

describe('mobile chat assistant & quick prompts', () => {
  it('provides quick prompts and resolves ambient transport safety query', () => {
    expect(defaultChatQuickPrompts.length).toBeGreaterThan(0);
    const res = resolveSupplaiAssistantQuery('Can we transport Oxytocin?');
    expect(res.category).toBe('safety');
    expect(res.reply.toLowerCase()).toContain('cold');
  });
});
