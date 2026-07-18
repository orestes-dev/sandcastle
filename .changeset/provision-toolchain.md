---
"@ai-hero/sandcastle": minor
---

Add a `provision` option to `run()` and `createSandbox()` that verifies a list of commands resolves on PATH inside the sandbox before the agent produces any commit. It runs after `onSandboxReady` hooks, so dependency installs have completed, and a missing command aborts the run with a `ProvisioningError` naming every gap. This makes a missing git-hook toolchain (`git`, `jq`, `bash`, the project's package manager) a loud provisioning failure rather than a silently skipped hook or a blanket `--no-verify` at commit time. All scaffolded templates now declare `provision: ["git", "jq", "bash"]` alongside their `npm install` hook, so a worker built from a template verifies its toolchain by default. The option defaults to empty, so existing configurations are unaffected.
