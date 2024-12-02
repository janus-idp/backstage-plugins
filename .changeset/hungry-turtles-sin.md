---
"@janus-idp/cli": patch
---

fix(cli): adjust embedded module searching. The CLI attempts a require call to detect built embedded packages, this change adjusts the directory this require is attempted from to be at the level of discovered package instead of the dynamic plugin package.
