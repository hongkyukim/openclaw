---
name: concern-logo
description: >
  Generate a small SVG logo (64×64 or custom size) that visually represents
  the emotional concern, sentiment, and urgency of a user's input message.
  Use when a user asks for a concern icon, emotion logo, sentiment badge, or
  visual representation of how a message "feels". No external APIs needed —
  fully offline, pure Node.js or Python.
---

# concern-logo

Generate a compact, polished SVG icon that represents the **emotional concern** of a user message — urgency, sentiment, topic, and tone — through color, shape, and iconography.

## Overview

The skill analyzes a message using keyword heuristics and maps it to one of 12 concern categories. Each category has a unique visual style: gradient color, icon shape, and ring color. The output is a clean, self-contained SVG (default 64×64 px).

### Concern Categories

| Category | Color | Shape | Triggers |
|---|---|---|---|
| `urgent` | 🔴 Red | Exclamation triangle | emergency, danger, asap, crisis |
| `warning` | 🟠 Orange | Warning triangle | problem, issue, broken, error |
| `health` | 🔴 Red/White | Cross | sick, pain, doctor, hospital |
| `finance` | 🟢 Green | Dollar sign | money, budget, debt, payment |
| `safety` | 🔵 Blue | Shield + checkmark | security, hack, password, breach |
| `relationship` | 🩷 Pink | Heart | love, family, breakup, lonely |
| `work` | 🟣 Indigo | Clock | deadline, meeting, boss, project |
| `sad` | 🩶 Grey-Blue | Teardrop | sad, grief, depressed, tears |
| `anxious` | 🟡 Amber | Spiral | anxious, panic, overwhelmed, fear |
| `confused` | 🟣 Purple | Question mark | confused, unsure, unclear, what? |
| `happy` | 🟢 Teal | Sun with rays | happy, awesome, celebrate, win |
| `calm` | 🩵 Sky Blue | Wave | ok, fine, calm, relax, neutral |

## Usage

### Via script (Node.js — preferred)

```bash
node scripts/generate.js "your message here"
node scripts/generate.js "urgent help needed" --output icon.svg
node scripts/generate.js "I feel calm today" --size 96 --output calm.svg
```

### Via script (Python fallback)

```bash
python3 scripts/generate.py "your message here"
python3 scripts/generate.py "warning: something broke" --output warn.svg --size 128
```

### Agent inline usage

When a user asks for a concern logo or emotion icon:

1. Read the user's message
2. Run: `node scripts/generate.js "<message>" --output /tmp/concern-logo.svg`
3. Report the detected category and return the SVG file path (or inline SVG)
4. Optionally open it: `open /tmp/concern-logo.svg`

### Inline SVG (no script)

If scripts are unavailable, the agent can generate SVG directly using the concern-map.json to look up the right category, then construct SVG using the patterns in references/concern-map.json.

## Output Format

The script outputs a valid, self-contained SVG:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <!-- gradient background circle + icon shape -->
</svg>
```

- Default size: **64×64 px**
- Self-contained (no external refs)
- Renders in any browser, Markdown viewer, or image tag

## Extending

Add new concern categories to `references/concern-map.json`:

```json
{
  "categories": {
    "my-category": {
      "keywords": ["keyword1", "keyword2"],
      "color": "#hex",
      "colorDark": "#hex",
      "ring": "#hex",
      "shape": "wave",
      "gradient": ["#hex1", "#hex2"]
    }
  }
}
```

Available shapes: `exclamation-triangle`, `warning-triangle`, `cross`, `dollar`, `shield`, `heart`, `clock`, `teardrop`, `spiral`, `question`, `sun`, `wave`

## Examples

See `references/examples/` for rendered SVGs:
- `urgent.svg` — Red exclamation triangle
- `warning.svg` — Orange warning triangle  
- `calm.svg` — Sky blue wave
- `sad.svg` — Grey-blue teardrop
- `happy.svg` — Teal sun with rays
