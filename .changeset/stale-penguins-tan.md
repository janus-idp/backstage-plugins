---
"@janus-idp/cli": patch
---

fix(cli): extend --ignore-version-check

This change updates the cli's --ignore-version-check flag to also ignore the check performed on an embedded transitive dependencies that are moved to peer dependencies, when it is known that the mismatch is runtime compatible.
