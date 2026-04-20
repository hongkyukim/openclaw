#!/usr/bin/env python3
"""
concern-logo/scripts/generate.py

Generates a small SVG logo representing the emotional concern of a message.

Usage:
    python3 generate.py "your message here" [--output file.svg] [--size 64]

Outputs SVG to stdout unless --output is specified.
Pure stdlib — no pip installs required.
"""

import sys
import os
import json
import argparse
import math
import random
import string

# ── Parse args ────────────────────────────────────────────────────────────────
parser = argparse.ArgumentParser(description='Generate concern logo SVG')
parser.add_argument('message', nargs='?', default='', help='Input message')
parser.add_argument('--output', '-o', help='Output file path (default: stdout)')
parser.add_argument('--size', '-s', type=int, default=64, help='SVG size in px (default: 64)')
args = parser.parse_args()

if not args.message:
    print('Usage: python3 generate.py "your message" [--output file.svg] [--size 64]', file=sys.stderr)
    sys.exit(1)

# ── Load concern map ──────────────────────────────────────────────────────────
script_dir = os.path.dirname(os.path.abspath(__file__))
map_path = os.path.join(script_dir, '..', 'references', 'concern-map.json')

try:
    with open(map_path) as f:
        concern_map = json.load(f)
except Exception:
    concern_map = {
        "categories": {
            "urgent": {"keywords": ["urgent","emergency","danger"], "color": "#ef4444", "colorDark": "#dc2626", "ring": "#991b1b", "shape": "exclamation-triangle", "gradient": ["#ef4444","#b91c1c"]},
            "happy":  {"keywords": ["happy","great","awesome"],    "color": "#10b981", "colorDark": "#059669", "ring": "#065f46", "shape": "sun",                  "gradient": ["#34d399","#059669"]},
            "sad":    {"keywords": ["sad","depressed","grief"],    "color": "#64748b", "colorDark": "#334155", "ring": "#1e293b", "shape": "teardrop",             "gradient": ["#94a3b8","#475569"]},
        },
        "default": {"color": "#94a3b8", "colorDark": "#475569", "ring": "#334155", "shape": "wave", "gradient": ["#cbd5e1","#64748b"]}
    }

# ── Classify message ──────────────────────────────────────────────────────────
def classify(text):
    lower = text.lower()
    best_cat, best_score = None, 0
    for name, cat in concern_map['categories'].items():
        score = sum(1 for kw in cat.get('keywords', []) if kw in lower)
        if score > best_score:
            best_score, best_cat = score, name
    if best_score > 0 and best_cat:
        return {'name': best_cat, **concern_map['categories'][best_cat]}
    return {'name': 'calm', **concern_map['default']}

# ── SVG shape generators ──────────────────────────────────────────────────────
def svg_shapes(shape, cx, cy, r, color, color_dark):
    s = r * 0.52

    def exclamation_triangle():
        h, w = s * 1.6, s * 1.6 * 1.15
        ty = cy - h * 0.52
        pts = f"{cx},{ty} {cx - w/2},{ty + h} {cx + w/2},{ty + h}"
        return (f'<polygon points="{pts}" fill="#fff2" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>'
                f'<rect x="{cx - s*0.095}" y="{cy - s*0.38}" width="{s*0.19}" height="{s*0.58}" rx="{s*0.06}" fill="white"/>'
                f'<circle cx="{cx}" cy="{cy + s*0.38}" r="{s*0.1}" fill="white"/>')

    def warning_triangle():
        h, w = s * 1.5, s * 1.5 * 1.15
        ty = cy - h * 0.5
        pts = f"{cx},{ty} {cx - w/2},{ty + h} {cx + w/2},{ty + h}"
        return (f'<polygon points="{pts}" fill="none" stroke="white" stroke-width="2.2" stroke-linejoin="round"/>'
                f'<rect x="{cx - s*0.09}" y="{cy - s*0.32}" width="{s*0.18}" height="{s*0.52}" rx="{s*0.06}" fill="white"/>'
                f'<circle cx="{cx}" cy="{cy + s*0.32}" r="{s*0.1}" fill="white"/>')

    def cross():
        return (f'<rect x="{cx - s*0.12}" y="{cy - s*0.55}" width="{s*0.24}" height="{s*1.1}" rx="{s*0.07}" fill="white"/>'
                f'<rect x="{cx - s*0.55}" y="{cy - s*0.12}" width="{s*1.1}" height="{s*0.24}" rx="{s*0.07}" fill="white"/>')

    def dollar():
        fs = s * 1.4
        return f'<text x="{cx}" y="{cy + s*0.42}" text-anchor="middle" font-family="Georgia,serif" font-size="{fs}px" font-weight="bold" fill="white" opacity="0.92">$</text>'

    def shield():
        sw, sh = s * 1.0, s * 1.2
        return (f'<path d="M{cx},{cy - sh*0.52} L{cx + sw*0.5},{cy - sh*0.22} L{cx + sw*0.5},{cy + sh*0.12}'
                f' Q{cx + sw*0.5},{cy + sh*0.52} {cx},{cy + sh*0.52}'
                f' Q{cx - sw*0.5},{cy + sh*0.52} {cx - sw*0.5},{cy + sh*0.12}'
                f' L{cx - sw*0.5},{cy - sh*0.22} Z" fill="none" stroke="white" stroke-width="2" stroke-linejoin="round"/>'
                f'<path d="M{cx - s*0.25},{cy} L{cx - s*0.05},{cy + s*0.28} L{cx + s*0.3},{cy - s*0.2}"'
                f' fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>')

    def heart():
        hs = s * 0.62
        return (f'<path d="M{cx},{cy + hs*0.6}'
                f' C{cx},{cy + hs*0.6} {cx - hs*1.1},{cy} {cx - hs*1.1},{cy - hs*0.35}'
                f' A{hs*0.55},{hs*0.55} 0 0,1 {cx},{cy - hs*0.05}'
                f' A{hs*0.55},{hs*0.55} 0 0,1 {cx + hs*1.1},{cy - hs*0.35}'
                f' C{cx + hs*1.1},{cy} {cx},{cy + hs*0.6} {cx},{cy + hs*0.6} Z"'
                f' fill="white" opacity="0.88"/>')

    def clock():
        return (f'<circle cx="{cx}" cy="{cy}" r="{s*0.6}" fill="none" stroke="white" stroke-width="2"/>'
                f'<line x1="{cx}" y1="{cy}" x2="{cx}" y2="{cy - s*0.45}" stroke="white" stroke-width="2.2" stroke-linecap="round"/>'
                f'<line x1="{cx}" y1="{cy}" x2="{cx + s*0.32}" y2="{cy + s*0.18}" stroke="white" stroke-width="1.8" stroke-linecap="round"/>'
                f'<circle cx="{cx}" cy="{cy}" r="{s*0.07}" fill="white"/>')

    def teardrop():
        return (f'<path d="M{cx},{cy - s*0.55}'
                f' C{cx + s*0.55},{cy} {cx + s*0.42},{cy + s*0.42}'
                f' {cx},{cy + s*0.6}'
                f' C{cx - s*0.42},{cy + s*0.42} {cx - s*0.55},{cy}'
                f' {cx},{cy - s*0.55} Z" fill="white" opacity="0.82"/>')

    def spiral():
        return (f'<path d="M{cx},{cy}'
                f' A{s*0.15},{s*0.15} 0 1,1 {cx - s*0.15},{cy}'
                f' A{s*0.3},{s*0.3} 0 1,0 {cx + s*0.3},{cy}'
                f' A{s*0.45},{s*0.45} 0 1,1 {cx - s*0.45},{cy}'
                f' A{s*0.55},{s*0.55} 0 0,0 {cx},{cy + s*0.55}"'
                f' fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/>')

    def question():
        fs = s * 1.45
        return f'<text x="{cx}" y="{cy + s*0.42}" text-anchor="middle" font-family="Arial,sans-serif" font-size="{fs}px" font-weight="bold" fill="white" opacity="0.9">?</text>'

    def sun():
        rays, inner, outer, center_r = 8, s*0.32, s*0.6, s*0.22
        ray_lines = ''
        for i in range(rays):
            angle = (i * 360 / rays) * math.pi / 180
            x1, y1 = cx + inner * math.cos(angle), cy + inner * math.sin(angle)
            x2, y2 = cx + outer * math.cos(angle), cy + outer * math.sin(angle)
            ray_lines += f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.8"/>'
        return ray_lines + f'<circle cx="{cx}" cy="{cy}" r="{center_r}" fill="white" opacity="0.9"/>'

    def wave():
        return (f'<path d="M{cx - s*0.65},{cy + s*0.1}'
                f' C{cx - s*0.4},{cy - s*0.3} {cx - s*0.15},{cy + s*0.3} {cx},{cy + s*0.1}'
                f' C{cx + s*0.2},{cy - s*0.15} {cx + s*0.45},{cy + s*0.28} {cx + s*0.65},{cy + s*0.1}"'
                f' fill="none" stroke="white" stroke-width="2.8" stroke-linecap="round" opacity="0.85"/>'
                f'<path d="M{cx - s*0.5},{cy - s*0.2}'
                f' C{cx - s*0.28},{cy - s*0.5} {cx - s*0.05},{cy + s*0.1} {cx + s*0.1},{cy - s*0.12}'
                f' C{cx + s*0.28},{cy - s*0.35} {cx + s*0.42},{cy + s*0.05} {cx + s*0.55},{cy - s*0.18}"'
                f' fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" opacity="0.5"/>')

    dispatch = {
        'exclamation-triangle': exclamation_triangle,
        'warning-triangle': warning_triangle,
        'cross': cross,
        'dollar': dollar,
        'shield': shield,
        'heart': heart,
        'clock': clock,
        'teardrop': teardrop,
        'spiral': spiral,
        'question': question,
        'sun': sun,
        'wave': wave,
    }
    fn = dispatch.get(shape, wave)
    return fn()

# ── Build SVG ─────────────────────────────────────────────────────────────────
def build_svg(category, size):
    cx = cy = size / 2
    r = size / 2 - 2
    rand = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    gid, sid = f'g{rand}', f's{rand}'
    gradient = category.get('gradient', [category['color'], category.get('colorDark', category['color'])])
    c1, c2 = gradient[0], gradient[1]
    color = category['color']
    color_dark = category.get('colorDark', c2)
    ring = category.get('ring', c2)
    shape = category.get('shape', 'wave')
    icon = svg_shapes(shape, cx, cy, r, color, color_dark)

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">
  <defs>
    <linearGradient id="{gid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{c1}"/>
      <stop offset="100%" stop-color="{c2}"/>
    </linearGradient>
    <filter id="{sid}" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="{color_dark}" flood-opacity="0.4"/>
    </filter>
  </defs>
  <circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#{gid})" filter="url(#{sid})"/>
  <circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{ring}" stroke-width="1.5" opacity="0.6"/>
  <g>{icon}</g>
</svg>"""

# ── Main ──────────────────────────────────────────────────────────────────────
category = classify(args.message)
svg = build_svg(category, args.size)

if args.output:
    with open(args.output, 'w') as f:
        f.write(svg)
    print(f"Saved to {args.output} (category: {category['name']})", file=sys.stderr)
else:
    print(svg)
