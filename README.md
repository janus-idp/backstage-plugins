# Backstage Plugins by Janus-IDP

Backstage is a single-page application composed of a set of plugins. This folder holds numerous plugins that are managed by this project.

For more information about the plugin ecosystem, see the documentation here:

> https://backstage.io/docs/plugins/

You can also see the [Plugin Marketplace](https://backstage.io/plugins) for other open source plugins you can add to your Backstage instance.

## Suggesting a plugin

If you start developing a plugin that you aim to release as open source, we suggest that you create a [new Issue](https://github.com/janus-idp/backstage-plugins/issues/new?template=plugin.md) in this repository as well as a [new Issue in the upstream](https://github.com/backstage/backstage/issues/new?template=plugin.md). This helps both the upstream Backstage and Janus-IDP communities know what plugins are in development.

You can also use this process if you have an idea for a good plugin but you hope that someone else will pick up the work.

## Start a new plugin

Run the following command to start a new plugin and follow the instructions:

```sh
yarn new
```

> Before developing your plugins please read the [Releasing packages](#releasing-packages) section of this readme. It will help you understand versioning, commit messages and publishing process.

## Develop a new plugin together with a local backstage instance

If you don't already have a backstage instance repository, you can easily create one via the following command. Please do so outside of this repository.

```sh
npx @backstage/create-app
```

Then, please [link](https://classic.yarnpkg.com/lang/en/docs/cli/link/) the plugin package to this instance:

```sh
pushd plugins/<YOUR_PLUGIN>
yarn link
popd
pushd <YOUR_BACKSTAGE_INSTANCE>
yarn link @janus-idp/<YOUR_PLUGIN>
popd
```

To revert this change, please use [`yarn unlink`](https://classic.yarnpkg.com/en/docs/cli/unlink) in reverse order.

## Releasing packages

Backstage plugins in the Janus-IDP community aim for high release velocity for the time being. This allows us to rapidly prototype, develop and test plugins in the wild. Current release schedule reflects this approach, therefore a new release is triggered on each **push** to the *main* branch. Only packages which are affected by the recent changes are released.

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

| Commit message | Release type |
| -------------- | ------------ |
| <pre>fix(pencil): stop graphite breaking when too much pressure applied</pre> | Fix Release (`vX.Y.⬆️` ) |
| <pre>feat(pencil): add 'graphiteWidth' option</pre> | Feature Release (`vX.⬆️.0`) |
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
