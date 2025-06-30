# @janus-idp/cli

<!-- prettier formatting breaks GitHub Markdown callouts, so this block is ignored -->
<!-- prettier-ignore-start -->
> [!WARNING] 
> **⚠️ DEPRECATION NOTICE**
>
> This CLI is **deprecated** and will no longer receive updates. Please migrate to the new **[@red-hat-developer-hub/cli](https://github.com/redhat-developer/rhdh-cli)**.
>
> **Command Migration:**
>
> - `npx @janus-idp/cli package export-dynamic-plugin` → `npx @red-hat-developer-hub/cli plugin export`
> - `npx @janus-idp/cli package package-dynamic-plugins` → `npx @red-hat-developer-hub/cli plugin package`
>
> For more information, visit: https://github.com/redhat-developer/rhdh-cli
>
> **📖 [View Migration Guide](./MIGRATION.md)** - Step-by-step instructions for migrating to the new CLI
<!-- prettier-ignore-end -->

This package provides a CLI for developing and exporting Backstage plugins as dynamic plugins. It implements a few new commands on top of the @backstage/cli codebase:

- `package export-dynamic plugin` - Exports a Backstage plugin to a dynamic plugin package
- `package package-dynamic-plugins` - Exports a monorepo of Backstage plugins to dynamic plugin packages in a container image
- `package schema` - Print configuration schema for a package
- `package metadata` - Add metadata to a package.json file

This package also has a modified version of the `package start` and `package build` commands that focus on building frontend plugins as well as the Developer Hub frontend app.

## Installation

Install the package via Yarn:

```sh
yarn add @janus-idp/cli
```

## Development

For local development the cli can be used directly, even from other packages in this repo. The `bin/janus-cli` entrypoint contains a switch that will load the implementation from the `src` directory when executed inside this repo.

To try out the command locally, you can execute the following from the parent directory of this repo:

```bash
./packages/cli/bin/janus-cli --help
```

## Documentation

- [Dynamic Plugins Documentation](https://github.com/janus-idp/backstage-showcase/blob/main/docs/dynamic-plugins/packaging-dynamic-plugins.md)
