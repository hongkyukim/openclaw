---
name: concern-logo
description: Analyzes the emotional concern or sentiment of a user's message and generates a small SVG icon/logo that visually represents that concern. Supports urgency levels 1–5, sentiment polarity, topic categories, and emotional tones. Fully offline — no external APIs required.
---

# concern-logo

## Overview

`concern-logo` analyzes a user's free-text message for emotional tone, urgency, sentiment, and topic category, then produces a small (64×64 or 96×96) self-contained SVG icon that visually encodes that concern.

**Key features:**
- Keyword + heuristic analysis — no API calls, works fully offline
- 12 concern categories mapped to distinct color palettes and icon shapes
- Urgency levels 1–5 encoded via border ring color intensity
- Output: a valid SVG string (stdout) or saved file

---

## Usage

### Via script (preferred)

```bash
# Analyze a message and print SVG to stdout
node scripts/generate.js "I'm worried about my health results"

# Save to file
node scripts/generate.js "Deadline in 2 hours!" --output deadline.svg

# Custom size (64 default, or 96)
node scripts/generate.js "everything is fine" --size 96 --output calm.svg

# Python fallback (pure stdlib)
python3 scripts/generate.py "urgent emergency help" --output urgent.svg
```

### Inline (agent generates SVG directly)

If scripts are unavailable, the agent should:
1. Analyze the message using the Concern Categories table below
2. Select the best-matching category
3. Construct a valid 64×64 SVG using the visual parameters
4. Return the SVG string or write it to disk

---

## Analysis Steps

When processing a user message, the agent should:

1. **Detect urgency** (1–5):
   - 5 = emergency/danger keywords
   - 4 = health/safety/warning keywords
   - 3 = stress/work/finance/relationship keywords
   - 2 = confused/uncertain keywords
   - 1 = calm/happy keywords

2. **Detect sentiment**: positive / neutral / negative

3. **Detect topic category**: health, finance, safety, relationship, work, general

4. **Detect emotional tone**: anxious, calm, warning, sad, happy, urgent, confused

5. **Map to visual parameters** using the table below

---

## Concern Categories

| Category        | Trigger Keywords (sample)                              | Color     | Shape              | Ring      | Urgency |
|-----------------|--------------------------------------------------------|-----------|--------------------|-----------|---------|
| `urgent`        | urgent, emergency, asap, critical, danger, sos         | `#ef4444` | exclamation-triangle | `#dc2626` | 5 |
| `warning`       | warning, careful, issue, problem, concern, worry        | `#f97316` | warning-triangle   | `#ea580c` | 4 |
| `anxious`       | anxious, stress, nervous, panic, overwhelmed, scared    | `#f59e0b` | spiral             | `#d97706` | 3 |
| `sad`           | sad, depressed, grief, cry, heartbroken, lonely         | `#6b7280` | teardrop           | `#4b5563` | 3 |
| `happy`         | happy, joy, excited, wonderful, success, celebrate      | `#10b981` | sun                | `#059669` | 1 |
| `calm`          | calm, relax, peaceful, ok, fine, steady, neutral        | `#3b82f6` | wave               | `#2563eb` | 1 |
| `health`        | health, sick, ill, pain, hospital, doctor, symptoms     | `#ef4444` | cross              | `#dc2626` | 4 |
| `finance`       | money, debt, loan, bank, bill, budget, invest, tax      | `#10b981` | dollar             | `#059669` | 3 |
| `safety`        | safe, security, protect, threat, breach, hack, attack   | `#1d4ed8` | shield             | `#1e40af` | 4 |
| `confused`      | confused, unclear, unsure, lost, question, complicated  | `#8b5cf6` | question           | `#7c3aed` | 2 |
| `work`          | work, deadline, job, project, boss, meeting, overdue    | `#475569` | clock              | `#334155` | 3 |
| `relationship`  | love, partner, family, breakup, heart, divorce, dating  | `#ec4899` | heart              | `#db2777` | 3 |

Full keyword lists and extended mappings: `references/concern-map.json`

---

## Output Format

The generated SVG:
- `viewBox="0 0 {size} {size}"` with explicit `width` and `height`
- Self-contained (no external references)
- Structure:
  1. `<defs>` — radial gradient + drop-shadow filter
  2. Background circle with radial gradient fill
  3. Border ring (thin stroke circle, color = `ring`)
  4. Icon symbol (white fill/stroke) using SVG paths/shapes

### Example output (64×64 urgent icon)

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <radialGradient id="bg" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ff8a8a"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </radialGradient>
    <filter id="dropshadow">
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#dc2626" flood-opacity="0.35"/>
    </filter>
  </defs>
  <circle cx="32" cy="32" r="30" fill="url(#bg)"/>
  <circle cx="32" cy="32" r="30" fill="none" stroke="#dc2626" stroke-width="2"/>
  <!-- exclamation triangle symbol -->
  ...
</svg>
```

---

## Examples

Pre-built example icons live in `references/examples/`:

| File          | Category     | Description                        |
|---------------|--------------|------------------------------------|
| `urgent.svg`  | urgent       | Red background, exclamation triangle |
| `warning.svg` | warning      | Orange background, warning triangle  |
| `calm.svg`    | calm         | Soft blue background, wave lines     |
| `sad.svg`     | sad          | Blue-grey background, teardrop shape |
| `happy.svg`   | happy        | Green background, sun with rays      |

---

## Extending

Add new categories or keywords by editing `references/concern-map.json`. The JSON schema:

```json
{
  "categories": {
    "<category-name>": {
      "keywords": ["keyword1", "keyword2"],
      "color": "#rrggbb",
      "ring": "#rrggbb",
      "shape": "<shape-name>",
      "urgency": 1
    }
  }
}
```

Supported shape names: `exclamation-triangle`, `warning-triangle`, `wave`, `spiral`, `teardrop`, `sun`, `cross`, `dollar`, `shield`, `question`, `clock`, `heart`
