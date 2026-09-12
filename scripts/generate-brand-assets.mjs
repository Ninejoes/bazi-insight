import fs from "fs";
import { execSync } from "child_process";

// 1. CREATE MASTER EMBLEM SVG (public/favicon.svg)
// A luxury 8-pointed golden celestial destiny star with astrolabe compass rings and central Chinese 命 (Destiny) character
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Rich metallic gold gradients -->
    <linearGradient id="goldLight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffbeb" />
      <stop offset="25%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#fbbf24" />
      <stop offset="75%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#92400e" />
    </linearGradient>
    <radialGradient id="celestialGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.35" />
      <stop offset="60%" stop-color="#d97706" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="darkBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#121624" />
      <stop offset="50%" stop-color="#090c15" />
      <stop offset="100%" stop-color="#04060a" />
    </linearGradient>
    <filter id="goldShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.6" />
    </filter>
  </defs>

  <!-- Deep Obsidian Background with Subtle Golden Rim -->
  <circle cx="256" cy="256" r="250" fill="url(#darkBg)" />
  <circle cx="256" cy="256" r="250" fill="url(#celestialGlow)" />
  <circle cx="256" cy="256" r="246" fill="none" stroke="url(#goldLight)" stroke-width="6" />
  <circle cx="256" cy="256" r="236" fill="none" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="4,6" opacity="0.7" />

  <!-- Outer Astrological Compass Notches (12 Directions / Zodiac) -->
  <g stroke="url(#goldLight)" stroke-width="3" stroke-linecap="round" opacity="0.85">
    <line x1="256" y1="20" x2="256" y2="38" />
    <line x1="256" y1="474" x2="256" y2="492" />
    <line x1="20" y1="256" x2="38" y2="256" />
    <line x1="474" y1="256" x2="492" y2="256" />
    <line x1="89" y1="89" x2="102" y2="102" />
    <line x1="410" y1="410" x2="423" y2="423" />
    <line x1="423" y1="89" x2="410" y2="102" />
    <line x1="102" y1="410" x2="89" y2="423" />
  </g>

  <!-- Middle Decorative Ring with Sacred Trigrams / Beads -->
  <circle cx="256" cy="256" r="200" fill="none" stroke="url(#goldLight)" stroke-width="2.5" opacity="0.6" />
  <g fill="#fbbf24">
    <circle cx="256" cy="62" r="4.5" />
    <circle cx="393" cy="119" r="4.5" />
    <circle cx="450" cy="256" r="4.5" />
    <circle cx="393" cy="393" r="4.5" />
    <circle cx="256" cy="450" r="4.5" />
    <circle cx="119" cy="393" r="4.5" />
    <circle cx="62" cy="256" r="4.5" />
    <circle cx="119" cy="119" r="4.5" />
  </g>

  <!-- Majestic 8-Pointed Celestial Destiny Star -->
  <g filter="url(#goldShadow)">
    <!-- Primary Cardinal 4-Star -->
    <path d="M256 65 L278 215 L428 237 L305 277 L256 427 L207 277 L84 237 L234 215 Z" fill="url(#goldLight)" />
    <!-- Secondary Diagonal 4-Star -->
    <path d="M256 120 L272 225 L377 241 L291 271 L256 376 L221 271 L135 241 L240 225 Z" fill="#d97706" opacity="0.75" />
  </g>

  <!-- Central Concentric Gold Mirror Medallion -->
  <circle cx="256" cy="256" r="92" fill="url(#darkBg)" stroke="url(#goldLight)" stroke-width="5" filter="url(#goldShadow)" />
  <circle cx="256" cy="256" r="82" fill="none" stroke="#fef08a" stroke-width="1.5" opacity="0.8" />

  <!-- Center Sacred Chinese Glyph: 命 (Destiny / Life) in Pure Gold -->
  <g fill="url(#goldLight)" filter="url(#goldShadow)">
    <text x="256" y="295" font-family="'Songti SC', 'SimSun', 'Noto Serif SC', 'Times New Roman', serif" font-size="108" font-weight="bold" text-anchor="middle" letter-spacing="0">
      命
    </text>
  </g>

  <!-- Divine 4 Tiny Star Accents around Center -->
  <circle cx="256" cy="180" r="3" fill="#fffbeb" />
  <circle cx="332" cy="256" r="3" fill="#fffbeb" />
  <circle cx="256" cy="332" r="3" fill="#fffbeb" />
  <circle cx="180" cy="256" r="3" fill="#fffbeb" />
</svg>
`;

fs.writeFileSync("public/favicon.svg", faviconSvg);
console.log("Created public/favicon.svg");

// 2. RASTERIZE PNG ICONS USING SIPS
execSync("sips -s format png public/favicon.svg --out public/icon-512.png --resampleWidth 512");
execSync("sips -s format png public/favicon.svg --out public/icon-192.png --resampleWidth 192");
execSync("sips -s format png public/favicon.svg --out public/apple-touch-icon.png --resampleWidth 180");
execSync("sips -s format png public/favicon.svg --out public/favicon-32.png --resampleWidth 32");
execSync("sips -s format png public/favicon.svg --out public/favicon-16.png --resampleWidth 16");

// Copy 32x32 to favicon.ico (valid PNG-in-ICO supported by all modern browsers)
fs.copyFileSync("public/favicon-32.png", "public/favicon.ico");
fs.unlinkSync("public/favicon-32.png");
fs.unlinkSync("public/favicon-16.png");
console.log("Created apple-touch-icon.png, icon-192.png, icon-512.png, favicon.ico");

// 3. CREATE MASTER 1200x630 OPEN GRAPH / SOCIAL SHARE PREVIEW IMAGE
// Embedded base64 of celestial-wheel.jpg background with crisp vector typography & badges
const bgBase64 = fs.readFileSync("public/images/celestial-wheel.jpg").toString("base64");
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="goldLight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffbeb" />
      <stop offset="25%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#fbbf24" />
      <stop offset="75%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
    <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(217, 119, 6, 0.2)" />
      <stop offset="100%" stop-color="rgba(0, 0, 0, 0.6)" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#000" flood-opacity="0.9" />
    </filter>
  </defs>

  <!-- 1. Background Celestial Art -->
  <image href="data:image/jpeg;base64,${bgBase64}" x="0" y="0" width="1200" height="630" preserveAspectRatio="xMidYMid slice" opacity="0.45" />

  <!-- 2. Rich Dark Vignette Gradient Overlays -->
  <rect width="1200" height="630" fill="rgba(4, 6, 12, 0.75)" />
  <radialGradient id="centerGlow" cx="50%" cy="45%" r="55%">
    <stop offset="0%" stop-color="rgba(212, 175, 55, 0.18)" />
    <stop offset="70%" stop-color="rgba(4, 6, 12, 0.85)" />
    <stop offset="100%" stop-color="rgba(2, 3, 6, 0.98)" />
  </radialGradient>
  <rect width="1200" height="630" fill="url(#centerGlow)" />

  <!-- 3. Ornate Double Gold Border with Corner Accents -->
  <rect x="25" y="25" width="1150" height="580" rx="20" fill="none" stroke="rgba(217, 119, 6, 0.4)" stroke-width="2" />
  <rect x="35" y="35" width="1130" height="560" rx="16" fill="none" stroke="url(#goldLight)" stroke-width="1.5" opacity="0.6" />

  <!-- Corner Brackets -->
  <path d="M 45 75 L 45 45 L 75 45" fill="none" stroke="#fbbf24" stroke-width="3" />
  <path d="M 1155 75 L 1155 45 L 1125 45" fill="none" stroke="#fbbf24" stroke-width="3" />
  <path d="M 45 555 L 45 585 L 75 585" fill="none" stroke="#fbbf24" stroke-width="3" />
  <path d="M 1155 555 L 1155 585 L 1125 585" fill="none" stroke="#fbbf24" stroke-width="3" />

  <!-- 4. Top Brand Header: LIKHITFA · ลิขิตฟ้า -->
  <g filter="url(#shadow)">
    <!-- Brand Capsule Badge -->
    <rect x="390" y="55" width="420" height="46" rx="23" fill="rgba(217, 119, 6, 0.22)" stroke="rgba(251, 191, 36, 0.6)" stroke-width="1.5" />
    <text x="600" y="85" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Sukhumvit Set', sans-serif" font-size="17" font-weight="700" fill="#fef08a" text-anchor="middle" letter-spacing="3">
      ✦ LIKHITFA · ลิขิตฟ้า ✦
    </text>
    <text x="600" y="128" font-family="'Songti SC', 'SimSun', serif" font-size="20" font-weight="normal" fill="#fbbf24" text-anchor="middle" letter-spacing="8" opacity="0.9">
      天 · 地 · 人 · 和
    </text>
  </g>

  <!-- 5. Main Punchy Title (ไม่ตัดคำ!) -->
  <g filter="url(#shadow)">
    <text x="600" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Sukhumvit Set', 'Kanit', sans-serif" font-size="52" font-weight="800" fill="#ffffff" text-anchor="middle">
      ศาสตร์พยากรณ์ชั้นสูงและไหว้พระออนไลน์
    </text>
    <text x="600" y="265" font-family="-apple-system, BlinkMacSystemFont, 'Sukhumvit Set', 'Kanit', sans-serif" font-size="24" font-weight="500" fill="#fef08a" text-anchor="middle" opacity="0.95">
      ถอดรหัสชีวิตด้วยหลักปาจื้อจีนโบราณ · ไพ่ยิปซี · กราฟชีวิต · เซียมซี · เลขมงคล
    </text>
  </g>

  <!-- 6. Five Pillar Feature Badges Grid -->
  <g transform="translate(85, 315)">
    <!-- Card 1: BaZi -->
    <g transform="translate(0, 0)">
      <rect width="190" height="135" rx="16" fill="url(#boxGrad)" stroke="rgba(251, 191, 36, 0.45)" stroke-width="1.5" filter="url(#shadow)" />
      <text x="95" y="45" font-family="sans-serif" font-size="28" text-anchor="middle">📜</text>
      <text x="95" y="80" font-family="sans-serif" font-size="18" font-weight="700" fill="#ffffff" text-anchor="middle">ปาจื้อ 4 เสา</text>
      <text x="95" y="105" font-family="sans-serif" font-size="13" fill="#cbd5e1" text-anchor="middle">ธาตุ &amp; วัยจรชะตา</text>
    </g>

    <!-- Card 2: Life Graph -->
    <g transform="translate(210, 0)">
      <rect width="190" height="135" rx="16" fill="url(#boxGrad)" stroke="rgba(251, 191, 36, 0.45)" stroke-width="1.5" filter="url(#shadow)" />
      <text x="95" y="45" font-family="sans-serif" font-size="28" text-anchor="middle">📈</text>
      <text x="95" y="80" font-family="sans-serif" font-size="18" font-weight="700" fill="#ffffff" text-anchor="middle">กราฟชีวิต 12 เรือน</text>
      <text x="95" y="105" font-family="sans-serif" font-size="13" fill="#cbd5e1" text-anchor="middle">ชี้ช่วงอายุทองคำ</text>
    </g>

    <!-- Card 3: Tarot -->
    <g transform="translate(420, 0)">
      <rect width="190" height="135" rx="16" fill="url(#boxGrad)" stroke="rgba(251, 191, 36, 0.45)" stroke-width="1.5" filter="url(#shadow)" />
      <text x="95" y="45" font-family="sans-serif" font-size="28" text-anchor="middle">🔮</text>
      <text x="95" y="80" font-family="sans-serif" font-size="18" font-weight="700" fill="#ffffff" text-anchor="middle">ไพ่ยิปซีพยากรณ์</text>
      <text x="95" y="105" font-family="sans-serif" font-size="13" fill="#cbd5e1" text-anchor="middle">รัก การงาน การเงิน</text>
    </g>

    <!-- Card 4: Virtual Shrine -->
    <g transform="translate(630, 0)">
      <rect width="190" height="135" rx="16" fill="url(#boxGrad)" stroke="rgba(251, 191, 36, 0.45)" stroke-width="1.5" filter="url(#shadow)" />
      <text x="95" y="45" font-family="sans-serif" font-size="28" text-anchor="middle">🪷</text>
      <text x="95" y="80" font-family="sans-serif" font-size="18" font-weight="700" fill="#ffffff" text-anchor="middle">ไหว้พระ 10 วัดดัง</text>
      <text x="95" y="105" font-family="sans-serif" font-size="13" fill="#cbd5e1" text-anchor="middle">รับเลขเด็ด &amp; นำทาง</text>
    </g>

    <!-- Card 5: Auspicious Numerology -->
    <g transform="translate(840, 0)">
      <rect width="190" height="135" rx="16" fill="url(#boxGrad)" stroke="rgba(251, 191, 36, 0.45)" stroke-width="1.5" filter="url(#shadow)" />
      <text x="95" y="45" font-family="sans-serif" font-size="28" text-anchor="middle">✨</text>
      <text x="95" y="80" font-family="sans-serif" font-size="18" font-weight="700" fill="#ffffff" text-anchor="middle">เลขศาสตร์ &amp; ฤกษ์</text>
      <text x="95" y="105" font-family="sans-serif" font-size="13" fill="#cbd5e1" text-anchor="middle">เบอร์มงคล ทะเบียน</text>
    </g>
  </g>

  <!-- 7. Bottom Gold Divider -->
  <line x1="150" y1="485" x2="1050" y2="485" stroke="url(#goldLight)" stroke-width="1.5" opacity="0.4" />

  <!-- 8. Footer Watermark & Official Domain (www.likhitfa.online) -->
  <g filter="url(#shadow)">
    <!-- Trust Pill on Left -->
    <text x="180" y="535" font-family="sans-serif" font-size="16" font-weight="600" fill="#94a3b8">
      แม่นยำ · ลึกซึ้ง · ใช้งานฟรี ไม่มีค่าใช้จ่าย
    </text>

    <!-- Domain on Right -->
    <text x="1020" y="535" font-family="sans-serif" font-size="24" font-weight="800" fill="url(#goldLight)" text-anchor="end" letter-spacing="1">
      www.likhitfa.online
    </text>
  </g>
</svg>
`;

fs.writeFileSync("public/og-image.svg", ogSvg);
// Render 1200x630 JPEG for Open Graph
execSync("sips -s format jpeg -s formatOptions 92 public/og-image.svg --out public/og-image.jpg");
// Render 1200x630 PNG for Twitter/high-end scrapers
execSync("sips -s format png public/og-image.svg --out public/og-image.png");
fs.unlinkSync("public/og-image.svg");

console.log("Successfully generated master og-image.jpg and og-image.png (1200x630)!");
