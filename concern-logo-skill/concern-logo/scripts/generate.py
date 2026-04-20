#!/usr/bin/env python3
"""
concern-logo/scripts/generate.py

Python fallback for generating concern-appropriate SVG icons.
Pure stdlib only — no pip installs required.

Usage:
    python3 generate.py "your message here"
    python3 generate.py "urgent help needed" --output urgent.svg --size 64
"""

import sys
import os
import argparse

# ─── Concern category definitions ────────────────────────────────────────────

CATEGORIES = {
    "urgent": {
        "keywords": [
            "urgent", "emergency", "asap", "critical", "immediately", "danger",
            "fatal", "crisis", "alarm", "sos", "911", "help me", "dying",
            "fire", "evacuate", "life threatening", "desperate", "severe",
        ],
        "color": "#ef4444", "color_light": "#ff8a8a", "ring": "#dc2626",
        "shape": "exclamation-triangle", "urgency": 5,
    },
    "warning": {
        "keywords": [
            "warning", "careful", "issue", "problem", "concern", "worry",
            "worried", "caution", "watch out", "beware", "alert", "trouble",
            "mistake", "error", "fault", "wrong", "broken",
        ],
        "color": "#f97316", "color_light": "#ffa855", "ring": "#ea580c",
        "shape": "warning-triangle", "urgency": 4,
    },
    "anxious": {
        "keywords": [
            "anxious", "anxiety", "stress", "stressed", "nervous", "panic",
            "overwhelmed", "scared", "afraid", "fear", "terrified", "dread",
            "tense", "uneasy", "restless", "apprehensive", "freaking out",
            "freaked", "cant cope", "can't cope",
        ],
        "color": "#f59e0b", "color_light": "#fcd34d", "ring": "#d97706",
        "shape": "spiral", "urgency": 3,
    },
    "sad": {
        "keywords": [
            "sad", "unhappy", "depressed", "depression", "grief", "sorrow",
            "cry", "crying", "tears", "heartbroken", "loss", "miss",
            "lonely", "alone", "hopeless", "miserable", "devastated",
            "gloomy", "melancholy", "blue", "mourn",
        ],
        "color": "#6b7280", "color_light": "#9ca3af", "ring": "#4b5563",
        "shape": "teardrop", "urgency": 3,
    },
    "happy": {
        "keywords": [
            "happy", "joy", "excited", "wonderful", "great", "amazing",
            "awesome", "fantastic", "celebrate", "celebration", "success",
            "win", "winning", "good news", "excellent", "perfect", "thrilled",
            "delighted", "glad", "elated", "overjoyed", "blessed", "grateful",
        ],
        "color": "#10b981", "color_light": "#6ee7b7", "ring": "#059669",
        "shape": "sun", "urgency": 1,
    },
    "calm": {
        "keywords": [
            "calm", "relax", "relaxed", "peaceful", "peace", "fine",
            "alright", "okay", "steady", "stable", "normal", "neutral",
            "wondering", "curious", "thinking", "quiet", "gentle", "still",
        ],
        "color": "#3b82f6", "color_light": "#93c5fd", "ring": "#2563eb",
        "shape": "wave", "urgency": 1,
    },
    "health": {
        "keywords": [
            "health", "sick", "ill", "illness", "disease", "pain", "hospital",
            "doctor", "medicine", "symptoms", "fever", "injury", "hurt",
            "ache", "medical", "diagnosis", "prescription", "treatment",
            "surgery", "recovery", "chronic", "infection", "virus",
        ],
        "color": "#ef4444", "color_light": "#fca5a5", "ring": "#dc2626",
        "shape": "cross", "urgency": 4,
    },
    "finance": {
        "keywords": [
            "money", "finance", "financial", "debt", "loan", "bank",
            "payment", "bill", "rent", "mortgage", "invest", "investment",
            "stock", "budget", "expense", "cost", "broke", "credit", "tax",
            "salary", "income", "savings", "afford", "expensive", "price",
        ],
        "color": "#10b981", "color_light": "#6ee7b7", "ring": "#059669",
        "shape": "dollar", "urgency": 3,
    },
    "safety": {
        "keywords": [
            "safe", "safety", "secure", "security", "protect", "protection",
            "threat", "risk", "guard", "vulnerable", "attack", "breach",
            "hack", "theft", "robbery", "violence", "abuse", "unsafe",
            "scam", "fraud", "phishing", "password", "privacy",
        ],
        "color": "#1d4ed8", "color_light": "#93c5fd", "ring": "#1e40af",
        "shape": "shield", "urgency": 4,
    },
    "confused": {
        "keywords": [
            "confused", "confusing", "unclear", "unsure", "uncertain", "lost",
            "don't understand", "dont understand", "complicated", "complex",
            "stuck", "not sure", "no idea", "help me understand",
            "makes no sense", "what does", "how does", "why does",
        ],
        "color": "#8b5cf6", "color_light": "#c4b5fd", "ring": "#7c3aed",
        "shape": "question", "urgency": 2,
    },
    "work": {
        "keywords": [
            "work", "deadline", "job", "project", "boss", "meeting",
            "office", "task", "assignment", "career", "overdue", "late",
            "schedule", "busy", "colleague", "client", "presentation",
            "fired", "resign", "layoff", "promotion", "performance review",
        ],
        "color": "#475569", "color_light": "#94a3b8", "ring": "#334155",
        "shape": "clock", "urgency": 3,
    },
    "relationship": {
        "keywords": [
            "relationship", "love", "partner", "family", "friend", "divorce",
            "breakup", "break up", "marriage", "girlfriend", "boyfriend",
            "husband", "wife", "romance", "dating", "cheating", "trust",
            "jealous", "crush", "rejection", "proposal", "wedding",
        ],
        "color": "#ec4899", "color_light": "#f9a8d4", "ring": "#db2777",
        "shape": "heart", "urgency": 3,
    },
}

# ─── Message analysis ─────────────────────────────────────────────────────────

def analyze_message(msg: str) -> dict:
    lower = msg.lower()
    scores = {}
    for name, cat in CATEGORIES.items():
        score = sum(1 for kw in cat["keywords"] if kw in lower)
        if score > 0:
            scores[name] = score

    if not scores:
        return {**CATEGORIES["calm"], "category": "calm"}

    best = sorted(scores.items(), key=lambda x: (x[1], CATEGORIES[x[0]]["urgency"]), reverse=True)[0][0]
    return {**CATEGORIES[best], "category": best}

# ─── Helpers ──────────────────────────────────────────────────────────────────

def f(v: float) -> str:
    return f"{v:.2f}"

# ─── Symbol generators ────────────────────────────────────────────────────────

def make_symbol(shape: str, cx: float, cy: float, r: float, cfg: dict) -> str:
    W  = "rgba(255,255,255,0.95)"
    WD = "rgba(255,255,255,0.65)"
    C  = cfg["color"]
    SH = ' filter="url(#ds)"'

    if shape == "exclamation-triangle":
        h, w = r * 1.5, r * 1.65
        tip = f"{f(cx)},{f(cy - h*0.5)}"
        bl  = f"{f(cx - w/2)},{f(cy + h*0.5)}"
        br  = f"{f(cx + w/2)},{f(cy + h*0.5)}"
        bw, bh = r*0.22, r*0.52
        by, dy = cy - h*0.27, cy + h*0.3
        dot = r*0.12
        return "\n  ".join([
            f'<polygon points="{tip} {br} {bl}" fill="{W}"{SH}/>',
            f'<rect x="{f(cx-bw/2)}" y="{f(by)}" width="{f(bw)}" height="{f(bh)}" rx="{f(bw*0.25)}" fill="{C}"/>',
            f'<circle cx="{f(cx)}" cy="{f(dy)}" r="{f(dot)}" fill="{C}"/>',
        ])

    elif shape == "warning-triangle":
        h, w = r * 1.4, r * 1.55
        tip = f"{f(cx)},{f(cy - h*0.48)}"
        bl  = f"{f(cx - w/2)},{f(cy + h*0.52)}"
        br  = f"{f(cx + w/2)},{f(cy + h*0.52)}"
        bw, bh = r*0.2, r*0.46
        by, dy = cy - h*0.24, cy + h*0.28
        dot = r*0.11
        return "\n  ".join([
            f'<polygon points="{tip} {br} {bl}" fill="{W}"{SH}/>',
            f'<rect x="{f(cx-bw/2)}" y="{f(by)}" width="{f(bw)}" height="{f(bh)}" rx="{f(bw*0.25)}" fill="{C}"/>',
            f'<circle cx="{f(cx)}" cy="{f(dy)}" r="{f(dot)}" fill="{C}"/>',
        ])

    elif shape == "wave":
        x1, x2 = cx - r*0.72, cx + r*0.72
        y1, y2 = cy - r*0.15, cy + r*0.22
        amp = r * 0.32
        sw1, sw2 = f(r*0.2), f(r*0.13)
        return "\n  ".join([
            f'<path d="M{f(x1)},{f(y1)} Q{f(cx-r*0.22)},{f(y1-amp)} {f(cx)},{f(y1)} Q{f(cx+r*0.22)},{f(y1+amp)} {f(x2)},{f(y1)}" fill="none" stroke="{W}" stroke-width="{sw1}" stroke-linecap="round"/>',
            f'<path d="M{f(x1)},{f(y2)} Q{f(cx-r*0.22)},{f(y2-amp)} {f(cx)},{f(y2)} Q{f(cx+r*0.22)},{f(y2+amp)} {f(x2)},{f(y2)}" fill="none" stroke="{WD}" stroke-width="{sw2}" stroke-linecap="round"/>',
        ])

    elif shape == "spiral":
        sx = cx - r*0.68
        sw = f(r*0.18)
        return "\n  ".join([
            f'<path d="M{f(sx)},{f(cy)} Q{f(cx-r*0.28)},{f(cy-r*0.62)} {f(cx)},{f(cy)} Q{f(cx+r*0.4)},{f(cy+r*0.48)} {f(cx+r*0.18)},{f(cy-r*0.22)} Q{f(cx+r*0.08)},{f(cy-r*0.52)} {f(cx-r*0.12)},{f(cy-r*0.3)}" fill="none" stroke="{W}" stroke-width="{sw}" stroke-linecap="round"/>',
            f'<circle cx="{f(cx-r*0.12)}" cy="{f(cy-r*0.3)}" r="{f(r*0.1)}" fill="{W}"/>',
        ])

    elif shape == "teardrop":
        tw, th = r*0.52, r*0.58
        bot, top = cy + r*0.62, cy - th
        return "\n  ".join([
            f'<path d="M{f(cx)},{f(bot)} C{f(cx-tw*1.05)},{f(cy+r*0.1)} {f(cx-tw)},{f(top+r*0.05)} {f(cx)},{f(top)} C{f(cx+tw)},{f(top+r*0.05)} {f(cx+tw*1.05)},{f(cy+r*0.1)} {f(cx)},{f(bot)}Z" fill="{W}"{SH}/>',
            f'<path d="M{f(cx-r*0.18)},{f(cy+r*0.22)} Q{f(cx)},{f(cy+r*0.45)} {f(cx+r*0.08)},{f(cy+r*0.22)}" fill="none" stroke="{C}" stroke-width="{f(r*0.12)}" stroke-linecap="round"/>',
        ])

    elif shape == "sun":
        import math
        rays = []
        for i in range(8):
            a = (i / 8) * math.pi * 2 - math.pi / 2
            cos_a, sin_a = math.cos(a), math.sin(a)
            rays.append(
                f'<line x1="{f(cx+cos_a*r*0.47)}" y1="{f(cy+sin_a*r*0.47)}" x2="{f(cx+cos_a*r*0.74)}" y2="{f(cy+sin_a*r*0.74)}" stroke="{W}" stroke-width="{f(r*0.15)}" stroke-linecap="round"/>'
            )
        return "\n  ".join(rays + [
            f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(r*0.37)}" fill="{W}"{SH}/>',
            f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(r*0.24)}" fill="{C}"/>',
        ])

    elif shape == "cross":
        arm, thick = r*0.62, r*0.22
        return "\n  ".join([
            f'<rect x="{f(cx-thick/2)}" y="{f(cy-arm/2)}" width="{f(thick)}" height="{f(arm)}" rx="{f(thick*0.22)}" fill="{W}"{SH}/>',
            f'<rect x="{f(cx-arm/2)}" y="{f(cy-thick/2)}" width="{f(arm)}" height="{f(thick)}" rx="{f(thick*0.22)}" fill="{W}"{SH}/>',
        ])

    elif shape == "dollar":
        fs = f(r * 1.15)
        return f'<text x="{f(cx)}" y="{f(cy+r*0.4)}" text-anchor="middle" font-family="sans-serif" font-size="{fs}" font-weight="bold" fill="{W}"{SH}>$</text>'

    elif shape == "shield":
        sw2, sh2 = r*1.1, r*1.25
        topY = cy - sh2*0.5
        midY = cy - sh2*0.12
        botY = cy + sh2*0.52
        return "\n  ".join([
            f'<path d="M{f(cx)},{f(topY)} L{f(cx+sw2*0.5)},{f(midY)} L{f(cx+sw2*0.5)},{f(cy+sh2*0.08)} Q{f(cx+sw2*0.5)},{f(botY)} {f(cx)},{f(botY)} Q{f(cx-sw2*0.5)},{f(botY)} {f(cx-sw2*0.5)},{f(cy+sh2*0.08)} L{f(cx-sw2*0.5)},{f(midY)} Z" fill="{W}" filter="url(#ds)"/>',
            f'<path d="M{f(cx)},{f(topY+sh2*0.18)} L{f(cx+sw2*0.28)},{f(cy-sh2*0.04)} L{f(cx+sw2*0.28)},{f(cy+sh2*0.06)} Q{f(cx)},{f(botY-sh2*0.12)} {f(cx)},{f(botY-sh2*0.12)} Q{f(cx-sw2*0.28)},{f(botY-sh2*0.12)} {f(cx-sw2*0.28)},{f(cy+sh2*0.06)} L{f(cx-sw2*0.28)},{f(cy-sh2*0.04)} Z" fill="{C}" opacity="0.55"/>',
        ])

    elif shape == "question":
        fs = f(r * 1.35)
        return f'<text x="{f(cx)}" y="{f(cy+r*0.45)}" text-anchor="middle" font-family="sans-serif" font-size="{fs}" font-weight="bold" fill="{W}" filter="url(#ds)">?</text>'

    elif shape == "clock":
        cr = r * 0.65
        return "\n  ".join([
            f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(cr)}" fill="{W}" filter="url(#ds)"/>',
            f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(cr)}" fill="none" stroke="{C}" stroke-width="{f(r*0.1)}"/>',
            f'<line x1="{f(cx)}" y1="{f(cy)}" x2="{f(cx)}" y2="{f(cy-r*0.36)}" stroke="{C}" stroke-width="{f(r*0.11)}" stroke-linecap="round"/>',
            f'<line x1="{f(cx)}" y1="{f(cy)}" x2="{f(cx+r*0.28)}" y2="{f(cy+r*0.17)}" stroke="{C}" stroke-width="{f(r*0.09)}" stroke-linecap="round"/>',
            f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(r*0.07)}" fill="{C}"/>',
        ])

    elif shape == "heart":
        hw, hh = r*0.68, r*0.62
        bot = cy + hh*0.72
        return f'<path d="M{f(cx)},{f(bot)} C{f(cx-hw)},{f(cy+hh*0.25)} {f(cx-hw*1.05)},{f(cy-hh*0.35)} {f(cx-hw*0.52)},{f(cy-hh*0.6)} C{f(cx-hw*0.15)},{f(cy-hh*0.92)} {f(cx)},{f(cy-hh*0.52)} {f(cx)},{f(cy-hh*0.18)} C{f(cx)},{f(cy-hh*0.52)} {f(cx+hw*0.15)},{f(cy-hh*0.92)} {f(cx+hw*0.52)},{f(cy-hh*0.6)} C{f(cx+hw*1.05)},{f(cy-hh*0.35)} {f(cx+hw)},{f(cy+hh*0.25)} {f(cx)},{f(bot)}Z" fill="{W}" filter="url(#ds)"/>'

    else:
        return f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(r*0.45)}" fill="{W}" filter="url(#ds)"/>'


# ─── SVG builder ──────────────────────────────────────────────────────────────

def build_svg(cfg: dict, sz: int) -> str:
    cx = cy = sz / 2
    r = sz / 2 - 2
    icon_r = r * 0.55
    cl = cfg.get("color_light", cfg["color"])

    defs = f"""  <defs>
    <radialGradient id="bg" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="{cl}"/>
      <stop offset="100%" stop-color="{cfg['color']}"/>
    </radialGradient>
    <filter id="ds" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="{cfg['ring']}" flood-opacity="0.35"/>
    </filter>
  </defs>"""

    bg = (
        f'  <circle cx="{f(cx)}" cy="{f(cy)}" r="{f(r)}" fill="url(#bg)"/>\n'
        f'  <circle cx="{f(cx)}" cy="{f(cy)}" r="{f(r)}" fill="none" stroke="{cfg["ring"]}" stroke-width="2"/>'
    )

    symbol = make_symbol(cfg["shape"], cx, cy, icon_r, cfg)

    return "\n".join([
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {sz} {sz}" width="{sz}" height="{sz}">',
        defs,
        bg,
        f"  {symbol}",
        "</svg>",
    ])


# ─── CLI ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Generate a concern-appropriate SVG icon from a text message."
    )
    parser.add_argument("message", help="Text message to analyze")
    parser.add_argument("--output", "-o", default=None, help="Output SVG file path")
    parser.add_argument("--size", "-s", type=int, default=64, help="Icon size in pixels (default: 64)")
    args = parser.parse_args()

    size = max(32, args.size)
    cfg = analyze_message(args.message)
    svg = build_svg(cfg, size)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as fh:
            fh.write(svg)
        print(f"[concern-logo] category={cfg['category']} urgency={cfg['urgency']} → {args.output}", file=sys.stderr)
    else:
        print(svg)


if __name__ == "__main__":
    main()
