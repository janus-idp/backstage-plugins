---
"@janus-idp/cli": patch
---

fix(cli): redirect install output. This change updates the CLI so that stdout of the `yarn install` command is redirected to a file. This prevents a possible buffer overflow error that can occur but also gives the added benefit of making the install output available for troubleshooting should a dynamic plugin fail to export. On successful installation and plugin validation the yarn install log file will be removed.
