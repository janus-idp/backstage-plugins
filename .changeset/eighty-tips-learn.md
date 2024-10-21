---
"@janus-idp/cli": patch
---

fix(cli): Improve example configuration display

This change changes the CLI package-dynamic-plugins command to take
advantage of some dynamic plugin projects that have followed the
convention of maintaining a app-config.janus-idp.yaml in the root of the
plugin source directory. When this file is present, it will be read in
as the command processes dynamic plugins in the monorepo and then
included in the example dynamic-plugins.yaml configuration printed out
when the command successfully completes. This change also adjusts the
control flow where this is printed out to ensure it's after successful
completion of the container image.
