---
"@janus-idp/cli": patch
---

fix(cli): add a flag to relax semver checks. This change updates the CLI to add an option to relax the semver checks on a per-package basis to cater for plugins where it is known there should be runtime compabability due to no interface changes.
