# Backstage Plugins by Janus IDP

![Apache 2.0 license](https://img.shields.io/github/license/janus-idp/backstage-plugins)
[![GitHub Workflow Status (Release)](https://img.shields.io/github/actions/workflow/status/janus-idp/backstage-plugins/push.yaml?label=Release)](https://github.com/janus-idp/backstage-plugins/actions/workflows/push.yaml)
[![Released packages](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fregistry.npmjs.com%2F-%2Fv1%2Fsearch%3Ftext%3D%40janus-idp&query=%24.objects.length&label=NPM%20packages)](https://www.npmjs.com/search?q=%40janus-idp)

Backstage is a single-page application composed of a set of plugins. This repository holds all plugins that are maintained, developed, and managed by the Janus IDP project.

For more information about the plugin ecosystem, see the upstream [documentation](https://backstage.io/docs/plugins/).

A subset of available Janus IDP plugins is available at our [community site](https://janus-idp.io/plugins).

You can also see the [Plugin Marketplace](https://backstage.io/plugins) for other open-source plugins you can add to your Backstage instance.

## Dynamic Plugins Installation

It is possible to install plugins without code changes in a backstage that supports [Dynamic Plugins](https://github.com/janus-idp/backstage-showcase/blob/main/showcase-docs/dynamic-plugins.md) (e.g. [Janus IDP](https://janus-idp.io/) and [Red Hat Developer Hub](https://developers.redhat.com/rhdh)). Follow the steps below to install a dynamic plugin:

- Map the dynamic plugins root directory in `app-config.local.yaml`:

```
dynamicPlugins:
  rootDirectory: dynamic-plugins-root
```

- Place your package inside the plugins root directly. You can pack a local plugin or download from NPM using `npm pack`, then make sure to extract it correctly into the plugin root directory:

```
cd dynamic-plugins-root
mkdir {plugin name}
tar -xzvf {path to the NPM package tgz file} -C {plugin name}  --strip-components=1
```

- Configure your plugin in `app-config.local.yaml`. For example, the configuration below will make a new menu item to access the plugin on route `my-plugin`:

```
dynamicPlugins:
  rootDirectory: dynamic-plugins-root
  frontend:
    {plugin name}:   # this should match the plugin name in package.json, remember to remove "@" and replace "/" by dots (".")
      pluginConfig:
      dynamicRoutes:
        - path: /my-plugin
          importName: MyPlugin   # the exported react component that should be rendered
          menuItem:
            text: My Plugin
```

- Start backstage and you should see in logs that your plugin was correctly scanned by Backstage:

```
scalprum info Loaded dynamic frontend plugin '{plugin name}' from '${Backstage path}/dynamic-plugins-root/{plugin name}'  type=plugin
```

Now when accessing Backstage you should see a new menu item with name `My Plugin` and when clicking on it your plugin will be rendered.

For more information check the [Dynamic Plugins Guide](https://github.com/janus-idp/backstage-showcase/blob/main/showcase-docs/dynamic-plugins.md).

---

✨ We would love for you to contribute to Janus IDP's collection of Backstage plugins and help make it even better than it is today! ✨

1. [**Contribution guide**](./CONTRIBUTING.md)
2. [**Code of Conduct**](./CODE_OF_CONDUCT.md)
