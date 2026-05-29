---
"@ai-hero/sandcastle": patch
---

Fix `syncOut` failing on the second run against the same isolated sandbox. `git am` rewrites SHAs on the host, so on every run after the first the previous host `HEAD` was unknown to the sandbox and `git format-patch hostHead..HEAD` aborted with `fatal: Invalid revision range`, losing the run's commits when the sandbox was torn down.

`syncOut` now tracks the last-synced commit in a sandbox-owned ref `refs/sandcastle/sync-base` and uses it as the patch base, falling back to host `HEAD` only when the ref is absent (run 1). The same ref is read by `SandboxLifecycle` via the new exported `countCommitsToSync` helper, fixing the related "No commits to sync out" misreport on run 2+. See ADR 0017.
