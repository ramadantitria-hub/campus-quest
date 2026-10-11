const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const createSvg = (isMaskable = false) => {
  // If maskable, scale elements down slightly so they stay strictly within 80% safe zone (circle radius 204px)
  const scale = isMaskable ? 0.78 : 0.92;
  const translate = isMaskable ? 56 : 20;

  return `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070a12" />
      <stop offset="50%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>

    <linearGradient id="roseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="40%" stop-color="#e11d48" />
      <stop offset="100%" stop-color="#9f1239" />
    </linearGradient>

    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde047" />
      <stop offset="100%" stop-color="#eab308" />
    </linearGradient>

    <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>

    <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#e11d48" flood-opacity="0.35" />
    </filter>

    <filter id="glowLight" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Full Background Canvas -->
  <rect width="512" height="512" fill="url(#bgGradient)" />

  <!-- Ambient Backdrop Glow -->
  <circle cx="256" cy="240" r="180" fill="#e11d48" opacity="0.18" filter="url(#glowLight)" />

  <g transform="translate(${translate}, ${translate}) scale(${scale})">
    <!-- Main App Squircle Emblem -->
    <rect 
      x="36" 
      y="36" 
      width="440" 
      height="440" 
      rx="105" 
      ry="105" 
      fill="url(#roseGradient)" 
      filter="url(#shadowFilter)" 
      stroke="rgba(255,255,255,0.22)" 
      stroke-width="3" 
    />

    <!-- Subtle Inner Highlight Rim -->
    <rect 
      x="42" 
      y="42" 
      width="428" 
      height="220" 
      rx="98" 
      ry="98" 
      fill="white" 
      opacity="0.08" 
    />

    <!-- Graduation Cap / Toga Emblem (UPI Academic Identity) -->
    <g transform="translate(256, 175)">
      <!-- Cap Diamond Top -->
      <polygon 
        points="0,-58 128,-14 0,30 -128,-14" 
        fill="#ffffff" 
      />
      <!-- Cap Skullcap Underneath -->
      <path 
        d="M -72, -4 L -72, 36 C -72, 70 72, 70 72, 36 L 72, -4 Z" 
        fill="#f8fafc" 
        opacity="0.95" 
      />
      <!-- Gold Button in Center -->
      <circle cx="0" cy="-14" r="8" fill="url(#goldGradient)" />
      <!-- Gold Tassel -->
      <path 
        d="M 0,-14 C 45,-14 85,10 94,48" 
        fill="none" 
        stroke="url(#goldGradient)" 
        stroke-width="6" 
        stroke-linecap="round" 
      />
      <circle cx="95" cy="54" r="7" fill="url(#goldGradient)" />
    </g>

    <!-- Typography: CQ (CampusQuest) Monogram -->
    <text 
      x="256" 
      y="350" 
      text-anchor="middle" 
      font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
      font-weight="900" 
      font-size="104" 
      letter-spacing="-3" 
      fill="#ffffff"
    >
      CQ
    </text>

    <!-- UPI Badge Pill -->
    <g transform="translate(256, 395)">
      <rect 
        x="-75" 
        y="-18" 
        width="150" 
        height="36" 
        rx="18" 
        fill="#090d16" 
        stroke="rgba(255,255,255,0.25)" 
        stroke-width="2" 
      />
      <text 
        x="0" 
        y="6" 
        text-anchor="middle" 
        font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
        font-weight="800" 
        font-size="20" 
        letter-spacing="3" 
        fill="#fda4af"
      >
        UPI
      </text>
    </g>

    <!-- Live Verified Emerald Badge on Top Right -->
    <g transform="translate(416, 96)">
      <circle cx="0" cy="0" r="22" fill="#090d16" />
      <circle cx="0" cy="0" r="16" fill="#10b981" />
      <!-- Checkmark -->
      <path 
        d="M -6,-1 L -2,4 L 7,-5" 
        fill="none" 
        stroke="#ffffff" 
        stroke-width="3.5" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
      />
    </g>
  </g>
</svg>
`;
};

async function generateAllIcons() {
  const publicDir = path.join(__dirname, '..', 'public');
  const standardSvg = Buffer.from(createSvg(false));
  const maskableSvg = Buffer.from(createSvg(true));

  console.log('Generating 512x512 standard icon...');
  await sharp(standardSvg)
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'icon-512.png'));

  console.log('Generating 192x192 standard icon...');
  await sharp(standardSvg)
    .resize(192, 192)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'icon-192.png'));

  console.log('Generating 180x180 Apple Touch icon...');
  await sharp(standardSvg)
    .resize(180, 180)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  console.log('Generating maskable 512x512 icon...');
  await sharp(maskableSvg)
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'icon-maskable-512.png'));

  console.log('Generating maskable 192x192 icon...');
  await sharp(maskableSvg)
    .resize(192, 192)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'icon-maskable-192.png'));

  console.log('Generating favicon 32x32...');
  await sharp(standardSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  console.log('All icons generated successfully!');
}

generateAllIcons().catch(console.error);
