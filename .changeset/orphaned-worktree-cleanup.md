---
"@ai-hero/sandcastle": patch
---

Fix orphaned worktrees when sandbox start fails (e.g. a missing Docker image). `run()`, `createSandbox()`, and `interactive()` now remove the freshly-created worktree if any setup step after worktree creation fails, instead of leaving it behind to require a manual `git worktree remove --force`. Covers all three worktree-creating branch strategies for bind-mount, isolated, and no-sandbox providers.
