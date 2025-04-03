---
"@janus-idp/cli": patch
---

Prepare for better compatibility with the upstream dynamic plugins support, by generating the config schema for backend plugins in both `dist/configSchema.json` (for backward compatibility with RHDH) and `dist/.config-schema.json` for consistency and compatibility with upstream.
