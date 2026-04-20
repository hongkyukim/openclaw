#!/usr/bin/env node
/**
 * concern-logo/scripts/generate.js
 *
 * Generates a small SVG logo representing the emotional concern of a message.
 *
 * Usage:
 *   node generate.js "your message here" [--output file.svg] [--size 64]
 *
 * Outputs SVG to stdout unless --output is specified.
 * No npm dependencies required.
 */

const fs = require('fs');
const path = require('path');

// ── Parse args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
let message = '';
let outputFile = null;
let size = 64;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--output' && args[i + 1]) { outputFile = args[++i]; }
  else if (args[i] === '--size' && args[i + 1]) { size = parseInt(args[++i], 10) || 64; }
  else if (!args[i].startsWith('--')) { message = args[i]; }
}

if (!message) {
  process.stderr.write('Usage: node generate.js "your message" [--output file.svg] [--size 64]\n');
  process.exit(1);
}

// ── Load concern map ──────────────────────────────────────────────────────────
const mapPath = path.join(__dirname, '..', 'references', 'concern-map.json');
let concernMap;
try {
  concernMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
} catch {
  // Fallback inline map if file not found
  concernMap = {
    categories: {
      urgent: { keywords: ['urgent','emergency','danger','help'], color: '#ef4444', colorDark: '#dc2626', ring: '#991b1b', shape: 'exclamation-triangle', gradient: ['#ef4444','#b91c1c'] },
      happy:  { keywords: ['happy','great','awesome'], color: '#10b981', colorDark: '#059669', ring: '#065f46', shape: 'sun', gradient: ['#34d399','#059669'] },
      sad:    { keywords: ['sad','depressed','grief'], color: '#64748b', colorDark: '#334155', ring: '#1e293b', shape: 'teardrop', gradient: ['#94a3b8','#475569'] },
    },
    default: { color: '#94a3b8', colorDark: '#475569', ring: '#334155', shape: 'wave', gradient: ['#cbd5e1','#64748b'] }
  };
}

// ── Classify message ──────────────────────────────────────────────────────────
function classify(text) {
  const lower = text.toLowerCase();
  let bestCategory = null;
  let bestScore = 0;

  for (const [name, cat] of Object.entries(concernMap.categories)) {
    let score = 0;
    for (const kw of cat.keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = name;
    }
  }

  return bestScore > 0
    ? { name: bestCategory, ...concernMap.categories[bestCategory] }
    : { name: 'calm', ...concernMap.default };
}

// ── SVG shape generators ──────────────────────────────────────────────────────
function svgShapes(shape, cx, cy, r, color, colorDark) {
  const s = r * 0.52; // icon scale relative to circle radius

  const shapes = {
    'exclamation-triangle': () => {
      const h = s * 1.6; const w = h * 1.15;
      const tx = cx, ty = cy - h * 0.52;
      const pts = `${tx},${ty} ${tx - w/2},${ty + h} ${tx + w/2},${ty + h}`;
      return `
        <polygon points="${pts}" fill="#fff2" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
        <rect x="${cx - s*0.095}" y="${cy - s*0.38}" width="${s*0.19}" height="${s*0.58}" rx="${s*0.06}" fill="white"/>
        <circle cx="${cx}" cy="${cy + s*0.38}" r="${s*0.1}" fill="white"/>`;
    },
    'warning-triangle': () => {
      const h = s * 1.5; const w = h * 1.15;
      const tx = cx, ty = cy - h * 0.5;
      const pts = `${tx},${ty} ${tx - w/2},${ty + h} ${tx + w/2},${ty + h}`;
      return `
        <polygon points="${pts}" fill="none" stroke="white" stroke-width="2.2" stroke-linejoin="round"/>
        <rect x="${cx - s*0.09}" y="${cy - s*0.32}" width="${s*0.18}" height="${s*0.52}" rx="${s*0.06}" fill="white"/>
        <circle cx="${cx}" cy="${cy + s*0.32}" r="${s*0.1}" fill="white"/>`;
    },
    'cross': () => `
        <rect x="${cx - s*0.12}" y="${cy - s*0.55}" width="${s*0.24}" height="${s*1.1}" rx="${s*0.07}" fill="white"/>
        <rect x="${cx - s*0.55}" y="${cy - s*0.12}" width="${s*1.1}" height="${s*0.24}" rx="${s*0.07}" fill="white"/>`,
    'dollar': () => `
        <text x="${cx}" y="${cy + s*0.42}" text-anchor="middle" font-family="Georgia,serif"
          font-size="${s * 1.4}px" font-weight="bold" fill="white" opacity="0.92">$</text>`,
    'shield': () => {
      const sw = s * 1.0, sh = s * 1.2;
      return `
        <path d="M${cx},${cy - sh*0.52} L${cx + sw*0.5},${cy - sh*0.22} L${cx + sw*0.5},${cy + sh*0.12}
          Q${cx + sw*0.5},${cy + sh*0.52} ${cx},${cy + sh*0.52}
          Q${cx - sw*0.5},${cy + sh*0.52} ${cx - sw*0.5},${cy + sh*0.12}
          L${cx - sw*0.5},${cy - sh*0.22} Z"
          fill="none" stroke="white" stroke-width="2" stroke-linejoin="round"/>
        <path d="M${cx - s*0.25},${cy} L${cx - s*0.05},${cy + s*0.28} L${cx + s*0.3},${cy - s*0.2}"
          fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    },
    'heart': () => {
      const hs = s * 0.62;
      return `
        <path d="M${cx},${cy + hs*0.6}
          C${cx},${cy + hs*0.6} ${cx - hs*1.1},${cy} ${cx - hs*1.1},${cy - hs*0.35}
          A${hs*0.55},${hs*0.55} 0 0,1 ${cx},${cy - hs*0.05}
          A${hs*0.55},${hs*0.55} 0 0,1 ${cx + hs*1.1},${cy - hs*0.35}
          C${cx + hs*1.1},${cy} ${cx},${cy + hs*0.6} ${cx},${cy + hs*0.6} Z"
          fill="white" opacity="0.88"/>`;
    },
    'clock': () => `
        <circle cx="${cx}" cy="${cy}" r="${s*0.6}" fill="none" stroke="white" stroke-width="2"/>
        <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - s*0.45}" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
        <line x1="${cx}" y1="${cy}" x2="${cx + s*0.32}" y2="${cy + s*0.18}" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
        <circle cx="${cx}" cy="${cy}" r="${s*0.07}" fill="white"/>`,
    'teardrop': () => `
        <path d="M${cx},${cy - s*0.55} C${cx + s*0.55},${cy} ${cx + s*0.42},${cy + s*0.42}
          ${cx},${cy + s*0.6} C${cx - s*0.42},${cy + s*0.42} ${cx - s*0.55},${cy}
          ${cx},${cy - s*0.55} Z" fill="white" opacity="0.82"/>`,
    'spiral': () => {
      // Approximate spiral with arcs
      return `
        <path d="M${cx},${cy}
          A${s*0.15},${s*0.15} 0 1,1 ${cx - s*0.15},${cy}
          A${s*0.3},${s*0.3} 0 1,0 ${cx + s*0.3},${cy}
          A${s*0.45},${s*0.45} 0 1,1 ${cx - s*0.45},${cy}
          A${s*0.55},${s*0.55} 0 0,0 ${cx},${cy + s*0.55}"
          fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/>`;
    },
    'question': () => `
        <text x="${cx}" y="${cy + s*0.42}" text-anchor="middle" font-family="Arial,sans-serif"
          font-size="${s * 1.45}px" font-weight="bold" fill="white" opacity="0.9">?</text>`,
    'sun': () => {
      const rays = 8;
      const inner = s * 0.32, outer = s * 0.6, center = s * 0.22;
      let rayPaths = '';
      for (let i = 0; i < rays; i++) {
        const angle = (i * 360 / rays) * Math.PI / 180;
        const x1 = cx + inner * Math.cos(angle), y1 = cy + inner * Math.sin(angle);
        const x2 = cx + outer * Math.cos(angle), y2 = cy + outer * Math.sin(angle);
        rayPaths += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.8"/>`;
      }
      return `${rayPaths}<circle cx="${cx}" cy="${cy}" r="${center}" fill="white" opacity="0.9"/>`;
    },
    'wave': () => `
        <path d="M${cx - s*0.65},${cy + s*0.1}
          C${cx - s*0.4},${cy - s*0.3} ${cx - s*0.15},${cy + s*0.3} ${cx},${cy + s*0.1}
          C${cx + s*0.2},${cy - s*0.15} ${cx + s*0.45},${cy + s*0.28} ${cx + s*0.65},${cy + s*0.1}"
          fill="none" stroke="white" stroke-width="2.8" stroke-linecap="round" opacity="0.85"/>
        <path d="M${cx - s*0.5},${cy - s*0.2}
          C${cx - s*0.28},${cy - s*0.5} ${cx - s*0.05},${cy + s*0.1} ${cx + s*0.1},${cy - s*0.12}
          C${cx + s*0.28},${cy - s*0.35} ${cx + s*0.42},${cy + s*0.05} ${cx + s*0.55},${cy - s*0.18}"
          fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" opacity="0.5"/>`,
  };

  return (shapes[shape] || shapes['wave'])();
}

// ── Build SVG ─────────────────────────────────────────────────────────────────
function buildSVG(category, size) {
  const cx = size / 2, cy = size / 2;
  const r = size / 2 - 2; // main circle radius
  const gid = `g${Math.random().toString(36).slice(2, 8)}`;
  const sid = `s${Math.random().toString(36).slice(2, 8)}`;
  const [c1, c2] = category.gradient || [category.color, category.colorDark];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="${gid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <filter id="${sid}" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="${category.colorDark || c2}" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Outer ring -->
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${gid})" filter="url(#${sid})"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${category.ring || c2}" stroke-width="1.5" opacity="0.6"/>

  <!-- Icon -->
  <g>${svgShapes(category.shape, cx, cy, r, category.color, category.colorDark)}</g>
</svg>`;
}

// ── Main ──────────────────────────────────────────────────────────────────────
const category = classify(message);
const svg = buildSVG(category, size);

if (outputFile) {
  fs.writeFileSync(outputFile, svg, 'utf8');
  process.stderr.write(`Saved to ${outputFile} (category: ${category.name})\n`);
} else {
  process.stdout.write(svg + '\n');
}
