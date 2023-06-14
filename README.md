# Backstage Plugins by Janus-IDP

Backstage is a single-page application composed of a set of plugins. This folder holds numerous plugins that are managed by this project.

For more information about the plugin ecosystem, see the documentation here:

> <https://backstage.io/docs/plugins/>

You can also see the [Plugin Marketplace](https://backstage.io/plugins) for other open source plugins you can add to your Backstage instance.

## Suggesting a plugin

If you start developing a plugin that you aim to release as open source, we suggest that you create a [new Issue](https://github.com/janus-idp/backstage-plugins/issues/new?template=plugin.md) in this repository as well as a [new Issue in the upstream](https://github.com/backstage/backstage/issues/new?template=plugin.md). This helps both the upstream Backstage and Janus-IDP communities know what plugins are in development.

You can also use this process if you have an idea for a good plugin but you hope that someone else will pick up the work.

## Create a new plugin

Run the following command to create a new plugin and follow the instructions:

```console
yarn new
```

> Before developing your plugins please read the [Releasing packages](#releasing-packages) section of this readme. It will help you understand versioning, commit messages and publishing process.

## Develop a new plugin together with a local backstage instance

Backstage's support for standalone plugin development is very limited (especially for backend plugins), therefore we include a minimal test instance within this repository.

1. Install the plugin via `yarn workspace [app|backend] add @janus-idp/<PLUGIN_NAME>@*` (`@*` at the end ensures the package is always linked to the local package in the `plugins` folder)
2. Run `yarn start:backstage`

### Developing a frontend plugin

In case your plugin supports standalone mode, you can use `yarn start --filter=<PLUGIN_NAME>` command in your plugin directory directly and you don't have to install the plugin as mentioned above.

### Plugin specific config file

You can augment the configuration for a plugin by running `yarn start --config <CONFIG_FILE>`.

## Releasing packages

Backstage plugins in the Janus-IDP community aim for high release velocity for the time being. This allows us to rapidly prototype, develop and test plugins in the wild. Current release schedule reflects this approach, therefore a new release is triggered on each **push** to the _main_ branch. Only packages which are affected by the recent changes are released.

### Configuration

1. `private: true` in the `package.json` ensures the package **is released to Git/GitHub only**. The package **is not released to NPM**.
2. You can use the [`publishConfig` key](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#publishconfig) in the `package.json` to influence NPM registry settings.

To make your package eligible for release automation and publicly available in NPM registry, please make sure your `package.json` contains following:

```diff
  {
-  "private": true,
...
+   "publishConfig": {
+     "access": "public"
+   }
  }
```

### Requirements

We use [semantic-release](https://semantic-release.gitbook.io/semantic-release/) (together with [multi-semantic-release](https://github.com/dhoulb/multi-semantic-release)).

Please read [following guidelines](https://semantic-release.gitbook.io/semantic-release/#commit-message-format) to learn, how to format your commit messages:

| Commit message                                                                                                                                                                                        | Release type                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| <pre>fix(pencil): stop graphite breaking when too much pressure applied</pre>                                                                                                                         | Fix Release (`vX.Y.⬆️` )                                                                                          |
| <pre>feat(pencil): add 'graphiteWidth' option</pre>                                                                                                                                                   | Feature Release (`vX.⬆️.0`)                                                                                       |
| <pre>perf(pencil): remove graphiteWidth option<br><br>BREAKING CHANGE: The graphiteWidth option has been removed.<br>The default graphite width of 10mm is always used for performance reasons.</pre> | Breaking Release (`v⬆️.0.0`) <br>(Note that the `BREAKING CHANGE:` token must be **in the footer** of the commit) |

Commit messages are used to populate a `CHANGELOG.md` file for each individual package (if the commit is relevant for that particular package folder).

### Release workflow

Semantic Release does following:

1. Analyzes commits for each package to determine if release is necessary (if there are changes in the package)
2. Generates `CHANGELOG.md` for each package to be released
3. Bumps version number in the `package.json` for each package
4. Creates a git tag `<package-name>@<version>` pointing to the new release
5. Creates a new GitHub release for each package
6. Publishes the new version to the NPM registry

## Common issues

- Error:

  ```log
  ERROR run failed: error preparing engine: Invalid persistent task configuration:
  You have <x - number> persistent tasks but `turbo` is configured for concurrency of 10. Set --concurrency to at least <x - number>
  ```

  Solution: You need to run `yarn start` with a [filter](https://turbo.build/repo/docs/core-concepts/monorepos/filtering). e.g. `yarn start --filter=<PLUGIN_NAME>`
