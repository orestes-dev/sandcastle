---
"@ai-hero/sandcastle": patch
---

`sandcastle init` now scaffolds `CLAUDE_CODE_OAUTH_TOKEN=` (with a commented `ANTHROPIC_API_KEY=` fallback) for the Claude Code agent, and the next-steps copy points users at `claude setup-token` instead of the closed issue #191.
