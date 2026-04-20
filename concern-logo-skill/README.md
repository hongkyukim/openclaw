# concern-logo

> Generate a small SVG icon that visually represents the emotional concern of a message.

## What it does

Analyzes a user's message for **urgency, sentiment, and topic** — then generates a polished 64×64 SVG badge using color, shape, and iconography to communicate the concern at a glance.

## Quick start

```bash
# Node.js (no install needed)
node scripts/generate.js "I'm really worried about the deadline"
# → outputs SVG to stdout, detected: work/deadline (indigo clock)

node scripts/generate.js "emergency! server is down!" --output alert.svg
# → saves red exclamation-triangle SVG

# Python fallback
python3 scripts/generate.py "feeling anxious and overwhelmed" --size 96
```

## Categories

| Concern | Visual |
|---------|--------|
| Urgent / Emergency | 🔴 Red + Exclamation triangle |
| Warning / Problem | 🟠 Orange + Warning triangle |
| Health | 🔴 Red + Cross |
| Finance | 🟢 Green + Dollar sign |
| Safety / Security | 🔵 Blue + Shield |
| Relationship | 🩷 Pink + Heart |
| Work / Deadline | 🟣 Indigo + Clock |
| Sad / Grief | 🩶 Grey-Blue + Teardrop |
| Anxious / Stressed | 🟡 Amber + Spiral |
| Confused | 🟣 Purple + Question mark |
| Happy / Positive | 🟢 Teal + Sun |
| Calm / Neutral | 🩵 Blue + Wave |

## Extending

Edit `references/concern-map.json` to add keywords or new categories. No code changes needed.

## Files

```
concern-logo/
  SKILL.md                    ← Agent instructions
  README.md                   ← This file
  scripts/
    generate.js               ← Node.js generator
    generate.py               ← Python 3 fallback
  references/
    concern-map.json          ← Keyword → visual style mapping
    examples/
      urgent.svg
      calm.svg
      warning.svg
      sad.svg
      happy.svg
```
