# @backstage/cli

## 0.4.3

### Patch Changes

- 19554f6d6: Added Github Actions for Create React App, and allow better imports of files inside a module when they're exposed using `files` in `package.json`
- 7d72f9b09: Fix for `app.listen.host` configuration not properly overriding listening host.

## 0.4.2

### Patch Changes

- c36a01b4c: Re-enable symlink resolution during bundling, and switch to using a resolve plugin for external linked packages.

## 0.4.1

### Patch Changes

- 06dbe707b: Update experimental backend bundle command to only output archives to `dist/` instead of a full workspace mirror in `dist-workspace/`.
- 011708102: Fixes a big in the bundling logic that caused `node_modules` inside local monorepo packages to be transformed.
- 61897fb2c: Fix config schema for `.app.listen`
- Updated dependencies [e3bd9fc2f]
- Updated dependencies [e3bd9fc2f]
  - @backstage/config@0.1.2

## 0.4.0

### Minor Changes

- 00670a96e: sort product panels and navigation menu by greatest cost
  update tsconfig.json to use ES2020 api

### Patch Changes

- b4488ddb0: Added a type alias for PositionError = GeolocationPositionError
- 4a655c89d: Bump versions of `esbuild` and `rollup-plugin-esbuild`
- 8a16e8af8: Support `.npmrc` when building with private NPM registries
- Updated dependencies [4e7091759]
- Updated dependencies [b4488ddb0]
  - @backstage/config-loader@0.4.0

## 0.3.2

### Patch Changes

- 294295453: Only load config that applies to the target package for frontend build and serve tasks. Also added `--package <name>` flag to scope the config schema used by the `config:print` and `config:check` commands.
- f538e2c56: Make versions:bump install new versions of dependencies that were within the specified range as well as install new versions of transitive @backstage dependencies.
- 8697dea5b: Bump Rollup
- b623cc275: Narrow down the version range of rollup-plugin-esbuild to avoid breaking change in newer version

## 0.3.1

### Patch Changes

- 29a0ccab2: The CLI now detects and transforms linked packages. You can link in external packages by adding them to both the `lerna.json` and `package.json` workspace paths.
- faf311c26: New lint rule to disallow <type> assertions and promote `as` assertions. - @typescript-eslint/consistent-type-assertions
- 31d8b6979: Add experimental backend:bundle command
- 991345969: Add new `versions:check` and `versions:bump` commands to simplify version management and avoid conflicts

## 0.3.0

### Minor Changes

- 1722cb53c: Added support for loading and validating configuration schemas, as well as declaring config visibility through schemas.

  The new `loadConfigSchema` function exported by `@backstage/config-loader` allows for the collection and merging of configuration schemas from all nearby dependencies of the project.

  A configuration schema is declared using the `https://backstage.io/schema/config-v1` JSON Schema meta schema, which is based on draft07. The only difference to the draft07 schema is the custom `visibility` keyword, which is used to indicate whether the given config value should be visible in the frontend or not. The possible values are `frontend`, `backend`, and `secret`, where `backend` is the default. A visibility of `secret` has the same scope at runtime, but it will be treated with more care in certain contexts, and defining both `frontend` and `secret` for the same value in two different schemas will result in an error during schema merging.

  Packages that wish to contribute configuration schema should declare it in a root `"configSchema"` field in `package.json`. The field can either contain an inlined JSON schema, or a relative path to a schema file. Schema files can be in either `.json` or `.d.ts` format.

  TypeScript configuration schema files should export a single `Config` type, for example:

  ```ts
  export interface Config {
    app: {
      /**
       * Frontend root URL
       * @visibility frontend
       */
      baseUrl: string;
    };
  }
  ```

### Patch Changes

- 1722cb53c: Added configuration schema
- 902340451: Support specifying listen host/port for frontend
- Updated dependencies [1722cb53c]
  - @backstage/config-loader@0.3.0

## 0.2.0

### Minor Changes

- 28edd7d29: Create backend plugin through CLI
- 1d0aec70f: Upgrade dependency `esbuild@0.7.7`
- 72f6cda35: Adds a new `BACKSTAGE_CLI_BUILD_PARELLEL` environment variable to control
  parallelism for some build steps.

  This is useful in CI to help avoid out of memory issues when using `terser`. The
  `BACKSTAGE_CLI_BUILD_PARELLEL` environment variable can be set to
  `true | false | [integer]` to override the default behaviour. See
  [terser-webpack-plugin](https://github.com/webpack-contrib/terser-webpack-plugin#parallel)
  for more details.

- 8c2b76e45: **BREAKING CHANGE**

  The existing loading of additional config files like `app-config.development.yaml` using APP_ENV or NODE_ENV has been removed.
  Instead, the CLI and backend process now accept one or more `--config` flags to load config files.

  Without passing any flags, `app-config.yaml` and, if it exists, `app-config.local.yaml` will be loaded.
  If passing any `--config <path>` flags, only those files will be loaded, **NOT** the default `app-config.yaml` one.

  The old behaviour of for example `APP_ENV=development` can be replicated using the following flags:

  ```bash
  --config ../../app-config.yaml --config ../../app-config.development.yaml
  ```

- 8afce088a: Use APP_ENV before NODE_ENV for determining what config to load

### Patch Changes

- 3472c8be7: Add codeowners processor

  - Include ESNext.Promise in TypeScript compilation

- a3840bed2: Upgrade dependency rollup-plugin-typescript2 to ^0.27.3
- cba4e4d97: Including source maps with all packages
- 9a3b3dbf1: Fixed duplicate help output, and print help on invalid command
- 7bbeb049f: Change loadBackendConfig to return the config directly
- Updated dependencies [8c2b76e45]
- Updated dependencies [ce5512bc0]
  - @backstage/config-loader@0.2.0
