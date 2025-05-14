---
"@janus-idp/cli": patch
---

This change updates the CLI to cater for the way modules are handled by `require` in node v20.19.0, which fixes an error that can be thrown by the CLI when an es6 or typescript module is picked up by `require`.
