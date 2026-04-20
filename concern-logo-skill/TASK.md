# Task: Build an OpenClaw "concern-logo" Skill

Create a complete OpenClaw agent skill called `concern-logo` that generates a small SVG logo/icon representing the **emotional concern or sentiment** of a user's input message.

## What it does
The skill analyzes the user's message for emotional tone, concern level, urgency, topic, and sentiment — then generates a small (64×64 or 96×96) SVG icon/logo that visually represents that concern.

## Output directory structure

```
concern-logo/
  SKILL.md          ← Agent instructions (how to use the skill)
  scripts/
    generate.js     ← Node.js script: reads message from argv, outputs SVG to stdout
    generate.py     ← Python fallback: same interface
  references/
    concern-map.json ← Maps concern categories to visual styles
    examples/
      urgent.svg
      calm.svg
      warning.svg
      sad.svg
      happy.svg
  README.md
```

## SKILL.md requirements
Follow the OpenClaw AgentSkills spec:
- YAML frontmatter with: name, description
- Section: Overview (what the skill does)
- Section: Usage (how the agent invokes it)
- Section: Concern Categories with mapping table
- Section: Output format
- Section: Examples

The agent should:
1. Analyze the input message for: urgency (1-5), sentiment (positive/neutral/negative), topic category (health, finance, safety, relationship, work, general), emotional tone (anxious, calm, warning, sad, happy, urgent, confused)
2. Map those to visual parameters (color, shape, icon symbol, intensity)
3. Call the generate script OR generate the SVG inline if no script available
4. Return the SVG (and optionally save it)

## generate.js requirements
- CLI: `node generate.js "your message here" [--output file.svg] [--size 64]`
- Analyzes message via simple keyword/heuristic matching (no external API required — fully offline)
- Outputs a clean 64×64 SVG with:
  - Background circle/shape with concern-appropriate color
  - Simple iconic symbol (⚠ triangle, ❤ heart, 🔥 flame shape, 💡 lightbulb, etc.) as SVG paths — NOT emoji characters
  - Subtle gradient and shadow for polish
  - A thin border ring color-coded by urgency
- Concern → visual mapping:
  - urgent/danger → red, sharp triangle/exclamation
  - warning → orange/amber, triangle with !
  - anxious/stressed → yellow-orange, wavy lines or spiral
  - sad/grief → blue-grey, downward arc / teardrop
  - happy/positive → green/teal, upward arc / sun rays
  - calm/neutral → soft blue, circle/wave
  - health → red cross on white
  - finance → dollar sign, green or red depending on sentiment
  - safety → shield shape, blue
  - confused → purple, question mark shape
  - work/deadline → grey-blue, clock shape
  - relationship → pink/rose, heart shape

## generate.py requirements
- Same interface as generate.js but Python
- `python generate.py "your message" [--output file.svg] [--size 64]`
- Pure stdlib only (no pip installs)

## concern-map.json
A JSON file mapping keywords/patterns to concern categories and visual styles:
```json
{
  "categories": {
    "urgent": { "keywords": ["urgent", "emergency", "asap", "critical", "immediately", "danger"], "color": "#ef4444", "shape": "triangle", "ring": "#dc2626" },
    "warning": { "keywords": ["warning", "careful", "issue", "problem", "concern", "worry"], "color": "#f97316", "shape": "warning-triangle", "ring": "#ea580c" },
    ...
  }
}
```

## Example SVGs
Create 5 small example SVGs (64×64) for the examples/ folder:
- urgent.svg — red, exclamation triangle
- calm.svg — soft blue, wave/circle
- warning.svg — orange, warning triangle
- sad.svg — blue-grey, teardrop/downward arc
- happy.svg — green, sun/upward arc

## README.md
Brief README explaining the skill, usage, and how to extend concern-map.json.

## Quality bar
- All SVGs must be valid, self-contained, and render in a browser
- generate.js must run with just `node` (no npm install needed)
- generate.py must run with just `python3` (no pip needed)
- SKILL.md must follow AgentSkills spec format

When done, output a summary of what was created. Then run:
openclaw system event --text "Done: concern-logo skill built at workspace/concern-logo-skill/" --mode now
