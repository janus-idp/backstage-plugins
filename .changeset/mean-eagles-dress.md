---
"@janus-idp/cli": minor
---

feat(cli) add flag to specify output directory

This change adds an --export-to flag to the package-dynamic-plugins CLI command. This flag will skip the container build step, and instead copy the staged dynamic plugin assets to the specified output directory. The addition of this flag makes the --tag argument optional, and only required if --export-to is not specified.
