import { run, claudeCode } from "@ai-hero/sandcastle";
import { docker } from "@ai-hero/sandcastle/sandboxes/docker";

// Blank template: customize this to build your own orchestration.
// Run this with: npx tsx .sandcastle/main.mts
// Or add to package.json scripts: "sandcastle": "npx tsx .sandcastle/main.mts"

await run({
  agent: claudeCode("claude-opus-4-8"),
  sandbox: docker(),
  promptFile: "./.sandcastle/prompt.md",

  // Verify the git-hook toolchain is present in the sandbox before the agent
  // runs, so commits run the repo's hooks instead of silently skipping them.
  // A missing tool aborts the run with a provisioning error rather than
  // degrading to --no-verify. Add your package manager (e.g. "npm") once you
  // wire up dependency install, and an onSandboxReady hook to run it.
  provision: ["git", "jq", "bash"],
});
