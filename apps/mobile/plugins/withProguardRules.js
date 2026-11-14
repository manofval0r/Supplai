const { withDangerousMod } = require('expo/config-plugins');
const fs = require('node:fs');
const path = require('node:path');

const PROGUARD_RULES = `
# Preserve Expo Kotlin reflective view constructors (prevents R8 crash on GLView/ExpoView)
-keep class expo.modules.gl.** { *; }
-keepclassmembers class * extends expo.modules.kotlin.views.ExpoView {
    <init>(android.content.Context);
    <init>(android.content.Context, expo.modules.kotlin.AppContext);
}
`;

/**
 * Appends R8/ProGuard keep rules so release Android builds do not strip
 * reflective constructors used by expo-gl and ExpoView subclasses.
 */
module.exports = function withProguardRules(config) {
  return withDangerousMod(config, [
    'android',
    async (modConfig) => {
      const proguardPath = path.join(
        modConfig.modRequest.platformProjectRoot,
        'app',
        'proguard-rules.pro',
      );
      if (fs.existsSync(proguardPath)) {
        const current = fs.readFileSync(proguardPath, 'utf8');
        if (!current.includes('-keep class expo.modules.gl.**')) {
          fs.writeFileSync(
            proguardPath,
            `${current.trimEnd()}\n${PROGUARD_RULES}`,
          );
        }
      }
      return modConfig;
    },
  ]);
};
