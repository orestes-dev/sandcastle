# Provision the toolchain before worker commits, never skip hooks

## Context

A sandcastle worker commits inside a container. The commit runs the repo's git
hooks, and those hooks need a toolchain: the CLI-only repo-contract hooks depend
on `git`, `jq`, and `bash`, while project checks (lint, tests, dedup scans)
additionally depend on installed dependencies and the package manager. When that
toolchain is absent, a worker commit either skips its hooks silently or fails
for environmental reasons. Both defeat enforcement.

This was observed in the field. In second-brain, worker commits skipped project
lint (a pre-commit gap). In food, a `jscpd` pre-commit hook blocked every commit
because the worktree duplicated files. The recurring escape used was
`--no-verify`, which bypasses every hook at once and silently, so the
Conventional Commits and content checks are lost along with the one that failed.

This is the worker side of a broader decision recorded in orestes/dotfiles#52
and its ADR 0002 (tiered git-hook enforcement). Project checks are guaranteed by
environment provisioning, not by graceful degradation: a check that finds its
dependencies absent hard-fails pointing at broken provisioning; it never
auto-skips. orestes/dotfiles#58 covers the local `git worktree` case; this ADR
covers the containerized worker.

## Decision

Provision the environment; do not degrade the checks. Two settings, both applied
before the agent produces any commit:

1. **Install dependencies** via an `onSandboxReady` hook (`npm install`), plus
   `copyToWorktree: ["node_modules"]` on bind-mount providers for fast startup.
   These hooks already fail fast on a non-zero exit.
2. **Verify the toolchain** with a new `provision` option: a list of commands
   that must resolve on PATH inside the sandbox. It runs after `onSandboxReady`
   hooks (so dependency installs have completed) and before the commit-producing
   work, in the one lifecycle chokepoint every `run()` and `createSandbox().run()`
   passes through (`withSandboxLifecycle`). Any missing command aborts the run
   with a `ProvisioningError` that names every gap and points at the sandbox
   image or hooks.

The scaffolded templates adopt `provision: ["git", "jq", "bash"]` (the
repo-contract toolchain) alongside the existing `npm install` hook, so a worker
built from any shipped template verifies its toolchain by default. The list is
extended per project with the package manager when a pre-commit hook shells out
to it.

A `ProvisioningError` is a loud, actionable failure state distinct from a hook
timeout or an exec error, so an operator sees "provisioning is broken, fix the
image" rather than a confusing mid-commit hook error. Because the toolchain is
provisioned rather than the checks skipped, `--no-verify` is retired as the
worker escape hatch.

## Considered Options

1. **Provision and verify** (chosen). The worker is a context we control, so we
   guarantee its toolchain and fail loudly when the guarantee is unmet.
2. **Graceful degradation: skip checks when tooling is absent.** Rejected, per
   ADR 0002. Skipping throws away the local feedback that catches failures
   before CI cost, and a silent skip is exactly the failure mode observed.
3. **Sanctioned `--no-verify` with mandatory disclosure.** Rejected. It relies
   on the agent choosing to disclose, and bypasses the commit-message and
   content hooks silently alongside the one that failed.
4. **Verify the toolchain unconditionally for every `run()`.** Rejected as a
   breaking change: sandcastle runs against arbitrary user images and providers
   that may legitimately lack `jq`. The check is opt-in (default empty) and the
   templates opt in, so existing users are unaffected and workers get the
   guarantee.
5. **Put the check purely in template shell (`command -v ...` in a hook).**
   Rejected as the primary mechanism: it is editable guidance, not a guarantee,
   and cannot surface a typed error. Kept the guarantee first-class in the
   library and let templates declare intent through `provision`.

## Consequences

- `run()` and `createSandbox()` gain a `provision?: ReadonlyArray<string>`
  option; `SandboxLifecycleOptions` gains the same, verified in
  `withSandboxLifecycle`. Empty or omitted skips the check, so the change is
  backward compatible.
- A new `ProvisioningError` joins the `SandboxError` union and is handled by
  `ErrorHandler`.
- All five scaffolded templates declare `provision: ["git", "jq", "bash"]`. The
  `blank` template declares it too, with a note to add the package manager once
  dependency install is wired up.
- The check runs once per `run()`; a reused `createSandbox()` handle re-verifies
  on every run.
