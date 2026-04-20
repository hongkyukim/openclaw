Create a professional, visually polished lecture presentation as a single self-contained HTML file called `index.html` using Reveal.js (load via CDN).

The topic is: **Major Use Cases of the OpenClaw App**

OpenClaw is a personal AI assistant platform that runs on macOS (and Linux/VPS). It connects to a user's accounts (email, calendar, messaging, GitHub, etc.) and acts as a proactive AI assistant with skills/tools. It supports multi-channel messaging (Discord, Signal, Telegram, WhatsApp), has a Gateway daemon for always-on operation, supports coding agents (Claude Code, Codex), has a skill system (clawhub.ai), memory system (MEMORY.md), heartbeat/cron scheduling, and more.

Build a ~12–15 slide deck covering these major use cases:
1. Personal Productivity Assistant (email, calendar, reminders, notes)
2. Coding Agent Orchestration (delegate to Claude Code, Codex — PR reviews, feature building)
3. Multi-Channel Messaging Hub (Discord, Signal, Telegram, WhatsApp)
4. Proactive Monitoring & Alerts (heartbeat, cron, periodic checks)
5. GitHub / DevOps Automation (issues, PRs, CI)
6. Security & Host Hardening (healthcheck skill)
7. Knowledge & Memory (MEMORY.md, session logs, Obsidian)
8. Weather, Web Research, Summarization (web skills)
9. Skill Ecosystem (clawhub.ai — install, publish, share skills)
10. Group Chat Participation (smart when to respond, reactions)

Slide design requirements:
- Dark theme (use Reveal.js "black" or "moon" theme via CDN)
- Each use case gets its own slide with: a big emoji icon, short title, 3–5 bullet points, and a brief code/CLI example where relevant
- Opening slide: title, subtitle "OpenClaw Platform Overview", and a brief tagline
- Closing slide: summary + call to action
- Use clean typography, good contrast, professional layout
- Make the HTML fully self-contained (all via CDN, no local dependencies)
- Include speaker notes (using <aside class="notes">) for each slide

Output only the file index.html. When completely finished, run: openclaw system event --text "Done: OpenClaw lecture deck built at workspace/openclaw-lecture/index.html" --mode now
