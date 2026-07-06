---
"@ai-hero/sandcastle": patch
---

Add `memory` and `memorySwap` options to the Docker and Podman sandbox providers that map to the `--memory` / `--memory-swap` flags on `docker run` / `podman run`, limiting the memory available to the container. Accepts Docker/Podman's human-readable byte units (e.g. `"512m"`, `"2g"`); when omitted, the container is left unconstrained.
