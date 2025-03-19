---
"@janus-idp/cli": patch
---

This change ensures the CLI properly updates any manually added resolutions a plugin has with the embedded version. This fixes cases where a plugin may be using resolutions for finer grained version control on packages the CLI would embed, such as native dependencies.
