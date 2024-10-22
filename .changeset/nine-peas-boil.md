---
"@janus-idp/cli": patch
---

fix(cli): allow mutable install for monorepo yarn.lock

This change updates the CLI to use `--no-immutable` when a plugin package or monorepo `yarn.lock` file is used during the `export-dynamic-plugin` command. Explicitly passing this flag avoids the default Yarn 3.x behavior of `--immutable` when the command is run in a CI environment.
