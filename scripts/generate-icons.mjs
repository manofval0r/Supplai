import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Master SVG (1024x1024 full app icon with rounded squircle background)
const masterIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1760DC"/>
      <stop offset="55%" stop-color="#124FB8"/>
      <stop offset="100%" stop-color="#071738"/>
    </linearGradient>
    <linearGradient id="limeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EAFF55"/>
      <stop offset="100%" stop-color="#CCFF1A"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="24" stdDeviation="28" flood-color="#020817" flood-opacity="0.45"/>
    </filter>
  </defs>
  
  <!-- Solid Background -->
  <rect width="1024" height="1024" fill="url(#bgGrad)"/>
  
  <!-- Decorative corridor route circles -->
  <circle cx="512" cy="512" r="390" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="4" fill="none" stroke-dasharray="16 16"/>
  <circle cx="512" cy="512" r="300" stroke="#D4FF24" stroke-opacity="0.14" stroke-width="3" fill="none"/>

  <!-- Main Acid Lime Dispatch Badge -->
  <g filter="url(#shadow)">
    <!-- Dispatch circular badge with messenger beak -->
    <path d="M 512 248
             A 264 264 0 1 1 278 644
             L 218 756
             L 350 726
             A 264 264 0 0 1 512 248 Z"
          fill="url(#limeGrad)"/>
    
    <!-- Bold Midnight Medical Cross -->
    <path d="M 512 376 V 648 M 376 512 H 648"
          stroke="#030407"
          stroke-width="66"
          stroke-linecap="round"/>
          
    <!-- Satellite corridor transit node -->
    <circle cx="732" cy="336" r="36" fill="#FFFFFF"/>
    <circle cx="732" cy="336" r="18" fill="#1558C9"/>
  </g>
</svg>
`;

// 2. Android Adaptive Foreground SVG (Transparent background, centered inside 66% safe zone)
const adaptiveForegroundSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <linearGradient id="limeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EAFF55"/>
      <stop offset="100%" stop-color="#CCFF1A"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="20" stdDeviation="24" flood-color="#020817" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Scaled to 80% to fit within Android adaptive icon mask (safe zone is central 66% = 675px) -->
  <g transform="translate(512 512) scale(0.82) translate(-512 -512)" filter="url(#shadow)">
    <path d="M 512 248
             A 264 264 0 1 1 278 644
             L 218 756
             L 350 726
             A 264 264 0 0 1 512 248 Z"
          fill="url(#limeGrad)"/>
    
    <path d="M 512 376 V 648 M 376 512 H 648"
          stroke="#030407"
          stroke-width="66"
          stroke-linecap="round"/>
          
    <circle cx="732" cy="336" r="36" fill="#FFFFFF"/>
    <circle cx="732" cy="336" r="18" fill="#1558C9"/>
  </g>
</svg>
`;

// 3. Android Adaptive Background SVG (1024x1024 solid gradient with subtle pattern)
const adaptiveBackgroundSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1760DC"/>
      <stop offset="55%" stop-color="#124FB8"/>
      <stop offset="100%" stop-color="#071738"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bgGrad)"/>
  <circle cx="512" cy="512" r="390" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="4" fill="none" stroke-dasharray="16 16"/>
  <circle cx="512" cy="512" r="300" stroke="#D4FF24" stroke-opacity="0.12" stroke-width="3" fill="none"/>
</svg>
`;

// 4. Android Adaptive Monochrome SVG (White on transparent for themed icons)
const adaptiveMonochromeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <g transform="translate(512 512) scale(0.82) translate(-512 -512)">
    <path d="M 512 248
             A 264 264 0 1 1 278 644
             L 218 756
             L 350 726
             A 264 264 0 0 1 512 248 Z"
          fill="#FFFFFF"/>
    
    <path d="M 512 376 V 648 M 376 512 H 648"
          stroke="#000000"
          stroke-width="66"
          stroke-linecap="round"/>
  </g>
</svg>
`;

// 5. Favicon SVG (High-contrast for 16x16, 32x32, 48x48 tab visibility)
const faviconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="14" fill="#1558C9"/>
  <circle cx="32" cy="32" r="22" fill="#D4FF24"/>
  <path d="M32 18 V46 M18 32 H46" stroke="#030407" stroke-width="6.5" stroke-linecap="round"/>
</svg>
`;

async function generate() {
  console.log('Generating Supplai icons with sharp...');
  
  const mobileAssets = path.join(rootDir, 'apps', 'mobile', 'assets');
  const dashboardPublic = path.join(rootDir, 'apps', 'dashboard', 'public');
  const dashboardApp = path.join(rootDir, 'apps', 'dashboard', 'app');

  if (!fs.existsSync(dashboardPublic)) {
    fs.mkdirSync(dashboardPublic, { recursive: true });
  }

  // 1. Mobile icon.png (1024x1024)
  await sharp(Buffer.from(masterIconSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(mobileAssets, 'icon.png'));
  console.log('Created apps/mobile/assets/icon.png (1024x1024)');

  // 2. Mobile adaptive foreground (1024x1024)
  await sharp(Buffer.from(adaptiveForegroundSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(mobileAssets, 'android-icon-foreground.png'));
  console.log('Created apps/mobile/assets/android-icon-foreground.png (1024x1024)');

  // 3. Mobile adaptive background (1024x1024)
  await sharp(Buffer.from(adaptiveBackgroundSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(mobileAssets, 'android-icon-background.png'));
  console.log('Created apps/mobile/assets/android-icon-background.png (1024x1024)');

  // 4. Mobile adaptive monochrome (1024x1024)
  await sharp(Buffer.from(adaptiveMonochromeSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(mobileAssets, 'android-icon-monochrome.png'));
  console.log('Created apps/mobile/assets/android-icon-monochrome.png (1024x1024)');

  // 5. Mobile splash-icon.png (512x512)
  await sharp(Buffer.from(adaptiveForegroundSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(mobileAssets, 'splash-icon.png'));
  console.log('Created apps/mobile/assets/splash-icon.png (512x512)');

  // 6. Mobile favicon.png (48x48)
  await sharp(Buffer.from(faviconSvg))
    .resize(48, 48)
    .png()
    .toFile(path.join(mobileAssets, 'favicon.png'));
  console.log('Created apps/mobile/assets/favicon.png (48x48)');

  // 7. Web Dashboard favicon.png and icon.png
  await sharp(Buffer.from(faviconSvg))
    .resize(48, 48)
    .png()
    .toFile(path.join(dashboardPublic, 'favicon.png'));
  await sharp(Buffer.from(faviconSvg))
    .resize(32, 32)
    .png()
    .toFile(path.join(dashboardPublic, 'favicon-32x32.png'));
  await sharp(Buffer.from(masterIconSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(dashboardApp, 'icon.png'));
  await sharp(Buffer.from(masterIconSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(dashboardApp, 'apple-icon.png'));
  await sharp(Buffer.from(faviconSvg))
    .resize(32, 32)
    .png()
    .toFile(path.join(dashboardApp, 'favicon.ico'));

  console.log('Created web dashboard favicons and app icons in apps/dashboard/public and apps/dashboard/app');
}

generate().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
