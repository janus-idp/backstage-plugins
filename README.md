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
