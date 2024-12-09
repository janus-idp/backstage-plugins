---
"@janus-idp/cli": patch
---

fix(cli): support single packages better. This change fixes an issue in the `package-dynamic-plugins` command that prevents it from running properly in a single plugin project that does not have workspaces.
