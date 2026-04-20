#!/usr/bin/env node
'use strict';

/**
 * concern-logo/scripts/generate.js
 *
 * Analyzes a text message and generates a concern-appropriate SVG icon.
 * No external dependencies — runs with plain `node`.
 *
 * Usage:
 *   node generate.js "your message here"
 *   node generate.js "urgent help needed" --output urgent.svg --size 64
 */

import fs from 'fs';

// ─── CLI argument parsing ─────────────────────────────────────────────────────

const args = process.argv.slice(2);
let message = '';
let outputFile = null;
let size = 64;

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if ((a === '--output' || a === '-o') && args[i + 1]) {
    outputFile = args[++i];
  } else if ((a === '--size' || a === '-s') && args[i + 1]) {
    size = Math.max(32, parseInt(args[++i], 10) || 64);
  } else if (!a.startsWith('-')) {
    message = a;
  }
}

if (!message) {
  process.stderr.write(
    'Usage: node generate.js "your message" [--output file.svg] [--size 64]\n'
  );
  process.exit(1);
}

// ─── Concern category definitions ────────────────────────────────────────────

const CATEGORIES = {
  urgent: {
    keywords: [
      'urgent', 'emergency', 'asap', 'critical', 'immediately', 'danger',
      'fatal', 'crisis', 'alarm', 'sos', '911', 'help me', 'dying',
      'fire', 'evacuate', 'life threatening', 'desperate', 'severe'
    ],
    color: '#ef4444', colorLight: '#ff8a8a', ring: '#dc2626',
    shape: 'exclamation-triangle', urgency: 5
  },
  warning: {
    keywords: [
      'warning', 'careful', 'issue', 'problem', 'concern', 'worry',
      'worried', 'caution', 'watch out', 'beware', 'alert', 'trouble',
      'mistake', 'error', 'fault', 'wrong', 'broken'
    ],
    color: '#f97316', colorLight: '#ffa855', ring: '#ea580c',
    shape: 'warning-triangle', urgency: 4
  },
  anxious: {
    keywords: [
      'anxious', 'anxiety', 'stress', 'stressed', 'nervous', 'panic',
      'overwhelmed', 'scared', 'afraid', 'fear', 'terrified', 'dread',
      'tense', 'uneasy', 'restless', 'apprehensive', 'freaking out',
      'freaked', 'cant cope', "can't cope"
    ],
    color: '#f59e0b', colorLight: '#fcd34d', ring: '#d97706',
    shape: 'spiral', urgency: 3
  },
  sad: {
    keywords: [
      'sad', 'unhappy', 'depressed', 'depression', 'grief', 'sorrow',
      'cry', 'crying', 'tears', 'heartbroken', 'loss', 'miss',
      'lonely', 'alone', 'hopeless', 'miserable', 'devastated',
      'gloomy', 'melancholy', 'blue', 'mourn'
    ],
    color: '#6b7280', colorLight: '#9ca3af', ring: '#4b5563',
    shape: 'teardrop', urgency: 3
  },
  happy: {
    keywords: [
      'happy', 'joy', 'excited', 'wonderful', 'great', 'amazing',
      'awesome', 'fantastic', 'celebrate', 'celebration', 'success',
      'win', 'winning', 'good news', 'excellent', 'perfect', 'thrilled',
      'delighted', 'glad', 'elated', 'overjoyed', 'blessed', 'grateful'
    ],
    color: '#10b981', colorLight: '#6ee7b7', ring: '#059669',
    shape: 'sun', urgency: 1
  },
  calm: {
    keywords: [
      'calm', 'relax', 'relaxed', 'peaceful', 'peace', 'fine',
      'alright', 'okay', 'steady', 'stable', 'normal', 'neutral',
      'wondering', 'curious', 'thinking', 'quiet', 'gentle', 'still'
    ],
    color: '#3b82f6', colorLight: '#93c5fd', ring: '#2563eb',
    shape: 'wave', urgency: 1
  },
  health: {
    keywords: [
      'health', 'sick', 'ill', 'illness', 'disease', 'pain', 'hospital',
      'doctor', 'medicine', 'symptoms', 'fever', 'injury', 'hurt',
      'ache', 'medical', 'diagnosis', 'prescription', 'treatment',
      'surgery', 'recovery', 'chronic', 'infection', 'virus'
    ],
    color: '#ef4444', colorLight: '#fca5a5', ring: '#dc2626',
    shape: 'cross', urgency: 4
  },
  finance: {
    keywords: [
      'money', 'finance', 'financial', 'debt', 'loan', 'bank',
      'payment', 'bill', 'rent', 'mortgage', 'invest', 'investment',
      'stock', 'budget', 'expense', 'cost', 'broke', 'credit', 'tax',
      'salary', 'income', 'savings', 'afford', 'expensive', 'price'
    ],
    color: '#10b981', colorLight: '#6ee7b7', ring: '#059669',
    shape: 'dollar', urgency: 3
  },
  safety: {
    keywords: [
      'safe', 'safety', 'secure', 'security', 'protect', 'protection',
      'threat', 'risk', 'guard', 'vulnerable', 'attack', 'breach',
      'hack', 'theft', 'robbery', 'violence', 'abuse', 'unsafe',
      'scam', 'fraud', 'phishing', 'password', 'privacy'
    ],
    color: '#1d4ed8', colorLight: '#93c5fd', ring: '#1e40af',
    shape: 'shield', urgency: 4
  },
  confused: {
    keywords: [
      'confused', 'confusing', 'unclear', 'unsure', 'uncertain', 'lost',
      "don't understand", 'dont understand', 'complicated', 'complex',
      'stuck', 'not sure', 'no idea', 'help me understand',
      'makes no sense', 'what does', 'how does', 'why does'
    ],
    color: '#8b5cf6', colorLight: '#c4b5fd', ring: '#7c3aed',
    shape: 'question', urgency: 2
  },
  work: {
    keywords: [
      'work', 'deadline', 'job', 'project', 'boss', 'meeting',
      'office', 'task', 'assignment', 'career', 'overdue', 'late',
      'schedule', 'busy', 'colleague', 'client', 'presentation',
      'fired', 'resign', 'layoff', 'promotion', 'performance review'
    ],
    color: '#475569', colorLight: '#94a3b8', ring: '#334155',
    shape: 'clock', urgency: 3
  },
  relationship: {
    keywords: [
      'relationship', 'love', 'partner', 'family', 'friend', 'divorce',
      'breakup', 'break up', 'marriage', 'girlfriend', 'boyfriend',
      'husband', 'wife', 'romance', 'dating', 'cheating', 'trust',
      'jealous', 'crush', 'rejection', 'proposal', 'wedding'
    ],
    color: '#ec4899', colorLight: '#f9a8d4', ring: '#db2777',
    shape: 'heart', urgency: 3
  }
};

// ─── Message analysis ─────────────────────────────────────────────────────────

function analyzeMessage(msg) {
  const lower = msg.toLowerCase();
  const scores = {};

  for (const [name, cat] of Object.entries(CATEGORIES)) {
    let score = 0;
    for (const kw of cat.keywords) {
      if (lower.includes(kw)) score += 1;
    }
    if (score > 0) scores[name] = score;
  }

  if (Object.keys(scores).length === 0) {
    return { ...CATEGORIES.calm, category: 'calm' };
  }

  const best = Object.entries(scores).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return CATEGORIES[b[0]].urgency - CATEGORIES[a[0]].urgency;
  })[0][0];

  return { ...CATEGORIES[best], category: best };
}

// ─── Color helpers ────────────────────────────────────────────────────────────

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lightenHex(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  const nr = Math.min(255, r + Math.round(255 * amount));
  const ng = Math.min(255, g + Math.round(255 * amount));
  const nb = Math.min(255, b + Math.round(255 * amount));
  return '#' + ((nr << 16) | (ng << 8) | nb).toString(16).padStart(6, '0');
}

// ─── SVG symbol generators ────────────────────────────────────────────────────

function n(v) { return parseFloat(v.toFixed(2)); }

function makeSymbol(shape, cx, cy, r, cfg) {
  const W = 'rgba(255,255,255,0.95)';
  const WD = 'rgba(255,255,255,0.65)';
  const C = cfg.color;
  const sh = ' filter="url(#ds)"';

  switch (shape) {

    case 'exclamation-triangle': {
      const h = r * 1.5, w = r * 1.65;
      const tip = `${n(cx)},${n(cy - h * 0.5)}`;
      const bl  = `${n(cx - w/2)},${n(cy + h * 0.5)}`;
      const br  = `${n(cx + w/2)},${n(cy + h * 0.5)}`;
      const bw  = r * 0.22, bh = r * 0.52, dot = r * 0.12;
      const by  = cy - h * 0.27, dy = cy + h * 0.3;
      return [
        `<polygon points="${tip} ${br} ${bl}" fill="${W}"${sh}/>`,
        `<rect x="${n(cx-bw/2)}" y="${n(by)}" width="${n(bw)}" height="${n(bh)}" rx="${n(bw*0.25)}" fill="${C}"/>`,
        `<circle cx="${n(cx)}" cy="${n(dy)}" r="${n(dot)}" fill="${C}"/>`
      ].join('\n  ');
    }

    case 'warning-triangle': {
      const h = r * 1.4, w = r * 1.55;
      const tip = `${n(cx)},${n(cy - h * 0.48)}`;
      const bl  = `${n(cx - w/2)},${n(cy + h * 0.52)}`;
      const br  = `${n(cx + w/2)},${n(cy + h * 0.52)}`;
      const bw  = r * 0.2, bh = r * 0.46, dot = r * 0.11;
      const by  = cy - h * 0.24, dy = cy + h * 0.28;
      return [
        `<polygon points="${tip} ${br} ${bl}" fill="${W}"${sh}/>`,
        `<rect x="${n(cx-bw/2)}" y="${n(by)}" width="${n(bw)}" height="${n(bh)}" rx="${n(bw*0.25)}" fill="${C}"/>`,
        `<circle cx="${n(cx)}" cy="${n(dy)}" r="${n(dot)}" fill="${C}"/>`
      ].join('\n  ');
    }

    case 'wave': {
      const x1 = cx - r*0.72, x2 = cx + r*0.72;
      const y1 = cy - r*0.15, y2 = cy + r*0.22;
      const amp = r * 0.32;
      return [
        `<path d="M${n(x1)},${n(y1)} Q${n(cx-r*0.22)},${n(y1-amp)} ${n(cx)},${n(y1)} Q${n(cx+r*0.22)},${n(y1+amp)} ${n(x2)},${n(y1)}" fill="none" stroke="${W}" stroke-width="${n(r*0.2)}" stroke-linecap="round"/>`,
        `<path d="M${n(x1)},${n(y2)} Q${n(cx-r*0.22)},${n(y2-amp)} ${n(cx)},${n(y2)} Q${n(cx+r*0.22)},${n(y2+amp)} ${n(x2)},${n(y2)}" fill="none" stroke="${WD}" stroke-width="${n(r*0.13)}" stroke-linecap="round"/>`
      ].join('\n  ');
    }

    case 'spiral': {
      const sx = cx - r*0.68;
      return [
        `<path d="M${n(sx)},${n(cy)} Q${n(cx-r*0.28)},${n(cy-r*0.62)} ${n(cx)},${n(cy)} Q${n(cx+r*0.4)},${n(cy+r*0.48)} ${n(cx+r*0.18)},${n(cy-r*0.22)} Q${n(cx+r*0.08)},${n(cy-r*0.52)} ${n(cx-r*0.12)},${n(cy-r*0.3)}" fill="none" stroke="${W}" stroke-width="${n(r*0.18)}" stroke-linecap="round"/>`,
        `<circle cx="${n(cx-r*0.12)}" cy="${n(cy-r*0.3)}" r="${n(r*0.1)}" fill="${W}"/>`
      ].join('\n  ');
    }

    case 'teardrop': {
      const tw = r * 0.52, th = r * 0.58;
      const bx = cx, top = cy - th, bot = cy + r * 0.62;
      return [
        `<path d="M${n(bx)},${n(bot)} C${n(bx-tw*1.05)},${n(cy+r*0.1)} ${n(bx-tw)},${n(top+r*0.05)} ${n(bx)},${n(top)} C${n(bx+tw)},${n(top+r*0.05)} ${n(bx+tw*1.05)},${n(cy+r*0.1)} ${n(bx)},${n(bot)}Z" fill="${W}"${sh}/>`,
        `<path d="M${n(cx-r*0.18)},${n(cy+r*0.22)} Q${n(cx)},${n(cy+r*0.45)} ${n(cx+r*0.08)},${n(cy+r*0.22)}" fill="none" stroke="${C}" stroke-width="${n(r*0.12)}" stroke-linecap="round"/>`
      ].join('\n  ');
    }

    case 'sun': {
      const numRays = 8;
      const rays = [];
      for (let i = 0; i < numRays; i++) {
        const a = (i / numRays) * Math.PI * 2 - Math.PI / 2;
        const cos = Math.cos(a), sin = Math.sin(a);
        rays.push(
          `<line x1="${n(cx + cos*r*0.47)}" y1="${n(cy + sin*r*0.47)}" x2="${n(cx + cos*r*0.74)}" y2="${n(cy + sin*r*0.74)}" stroke="${W}" stroke-width="${n(r*0.15)}" stroke-linecap="round"/>`
        );
      }
      return [
        ...rays,
        `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r*0.37)}" fill="${W}"${sh}/>`,
        `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r*0.24)}" fill="${C}"/>`
      ].join('\n  ');
    }

    case 'cross': {
      const arm = r * 0.62, thick = r * 0.22;
      return [
        `<rect x="${n(cx-thick/2)}" y="${n(cy-arm/2)}" width="${n(thick)}" height="${n(arm)}" rx="${n(thick*0.22)}" fill="${W}"${sh}/>`,
        `<rect x="${n(cx-arm/2)}" y="${n(cy-thick/2)}" width="${n(arm)}" height="${n(thick)}" rx="${n(thick*0.22)}" fill="${W}"${sh}/>`
      ].join('\n  ');
    }

    case 'dollar': {
      const fs = n(r * 1.15);
      return [
        `<text x="${n(cx)}" y="${n(cy + r*0.4)}" text-anchor="middle" font-family="sans-serif" font-size="${fs}" font-weight="bold" fill="${W}"${sh}>$</text>`
      ].join('\n  ');
    }

    case 'shield': {
      const sw = r * 1.1, sh2 = r * 1.25;
      const tx = cx, topY = cy - sh2*0.5;
      const midY = cy - sh2*0.12, botY = cy + sh2*0.52;
      return [
        `<path d="M${n(tx)},${n(topY)} L${n(tx+sw*0.5)},${n(midY)} L${n(tx+sw*0.5)},${n(cy+sh2*0.08)} Q${n(tx+sw*0.5)},${n(botY)} ${n(tx)},${n(botY)} Q${n(tx-sw*0.5)},${n(botY)} ${n(tx-sw*0.5)},${n(cy+sh2*0.08)} L${n(tx-sw*0.5)},${n(midY)} Z" fill="${W}" filter="url(#ds)"/>`,
        `<path d="M${n(tx)},${n(topY+sh2*0.18)} L${n(tx+sw*0.28)},${n(cy-sh2*0.04)} L${n(tx+sw*0.28)},${n(cy+sh2*0.06)} Q${n(tx)},${n(botY-sh2*0.12)} ${n(tx)},${n(botY-sh2*0.12)} Q${n(tx-sw*0.28)},${n(botY-sh2*0.12)} ${n(tx-sw*0.28)},${n(cy+sh2*0.06)} L${n(tx-sw*0.28)},${n(cy-sh2*0.04)} Z" fill="${C}" opacity="0.55"/>`
      ].join('\n  ');
    }

    case 'question': {
      const fs = n(r * 1.35);
      return [
        `<text x="${n(cx)}" y="${n(cy + r*0.45)}" text-anchor="middle" font-family="sans-serif" font-size="${fs}" font-weight="bold" fill="${W}" filter="url(#ds)">?</text>`
      ].join('\n  ');
    }

    case 'clock': {
      const cr = r * 0.65;
      const hand1x = cx, hand1y = cy - r*0.36;
      const hand2x = cx + r*0.28, hand2y = cy + r*0.17;
      return [
        `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(cr)}" fill="${W}" filter="url(#ds)"/>`,
        `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(cr)}" fill="none" stroke="${C}" stroke-width="${n(r*0.1)}"/>`,
        `<line x1="${n(cx)}" y1="${n(cy)}" x2="${n(hand1x)}" y2="${n(hand1y)}" stroke="${C}" stroke-width="${n(r*0.11)}" stroke-linecap="round"/>`,
        `<line x1="${n(cx)}" y1="${n(cy)}" x2="${n(hand2x)}" y2="${n(hand2y)}" stroke="${C}" stroke-width="${n(r*0.09)}" stroke-linecap="round"/>`,
        `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r*0.07)}" fill="${C}"/>`
      ].join('\n  ');
    }

    case 'heart': {
      const hw = r * 0.68, hh = r * 0.62;
      const bx = cx, bot = cy + hh * 0.72;
      return [
        `<path d="M${n(bx)},${n(bot)} C${n(bx-hw)},${n(cy+hh*0.25)} ${n(bx-hw*1.05)},${n(cy-hh*0.35)} ${n(bx-hw*0.52)},${n(cy-hh*0.6)} C${n(bx-hw*0.15)},${n(cy-hh*0.92)} ${n(bx)},${n(cy-hh*0.52)} ${n(bx)},${n(cy-hh*0.18)} C${n(bx)},${n(cy-hh*0.52)} ${n(bx+hw*0.15)},${n(cy-hh*0.92)} ${n(bx+hw*0.52)},${n(cy-hh*0.6)} C${n(bx+hw*1.05)},${n(cy-hh*0.35)} ${n(bx+hw)},${n(cy+hh*0.25)} ${n(bx)},${n(bot)}Z" fill="${W}" filter="url(#ds)"/>`
      ].join('\n  ');
    }

    default:
      return `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r*0.45)}" fill="${W}" filter="url(#ds)"/>`;
  }
}

// ─── SVG builder ──────────────────────────────────────────────────────────────

function buildSVG(cfg, sz) {
  const cx = sz / 2, cy = sz / 2;
  const r  = sz / 2 - 2;
  const iconR = r * 0.55;
  const cl = cfg.colorLight || lightenHex(cfg.color, 0.3);

  const defs = `  <defs>
    <radialGradient id="bg" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="${cl}"/>
      <stop offset="100%" stop-color="${cfg.color}"/>
    </radialGradient>
    <filter id="ds" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="${cfg.ring}" flood-opacity="0.35"/>
    </filter>
  </defs>`;

  const bg = [
    `  <circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="url(#bg)"/>`,
    `  <circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="none" stroke="${cfg.ring}" stroke-width="2"/>`
  ].join('\n');

  const symbol = makeSymbol(cfg.shape, cx, cy, iconR, cfg);

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sz} ${sz}" width="${sz}" height="${sz}">`,
    defs,
    bg,
    `  ${symbol}`,
    `</svg>`
  ].join('\n');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const cfg = analyzeMessage(message);
const svg = buildSVG(cfg, size);

if (outputFile) {
  fs.writeFileSync(outputFile, svg, 'utf8');
  process.stderr.write(`[concern-logo] category=${cfg.category} urgency=${cfg.urgency} → ${outputFile}\n`);
} else {
  process.stdout.write(svg + '\n');
}
