---
"@janus-idp/cli": patch
---

This change adds two new flags to handle native module dependencies.

- `--allow-native-package [package-name...]`: flag to selectively allow native packages when exporting a dynamic plugin and allowing it's installation into the exported dynamic plugin.

- `--suppress-native-package [package-name..]`: flag which replaces the native package with an empty package during export, preventing the native package's inclusion into the exported dynamic plugin's private dependencies.
