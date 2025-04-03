---
"@janus-idp/cli": patch
---

This change updates the package-dynamic-plugins command to use the exported plugin package name rather than deriving a package name from the base plugin package and package role. This change also ensures the exported plugin metadata is taken from the exported package instead of the original package. This change will potentially affect the final directory name of exported plugins.
