---
"@ai-hero/sandcastle": patch
---

Fix `npm run build` failing when this package is installed as a git dependency (e.g. `npm install github:orestes-dev/sandcastle` or Yarn's equivalent git resolver). Yarn/npm bootstrap git dependencies with `npm install --legacy-peer-deps`, which skips auto-installing peer dependencies. `@effect/platform-node`, `@effect/printer-ansi`, and other `effect` ecosystem packages declare `@effect/cluster`, `@effect/rpc`, `@effect/typeclass`, `@effect/sql`, `@effect/workflow`, and `@effect/experimental` as peer dependencies rather than direct dependencies, so under `--legacy-peer-deps` they were never installed, and `tsup` failed to resolve their subpath imports during the `prepare` build step. Adding them as explicit `devDependencies` ensures they're installed regardless of the peer-dependency install flag.
