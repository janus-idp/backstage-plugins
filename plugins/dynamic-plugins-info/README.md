# Dynamic Plugins Info plugin for Backstage

The dynamic-plugins-info plugin is a frontend component for the [dynamic-plugins-info-backend](https://github.com/janus-idp/backstage-showcase/tree/main/plugins/dynamic-plugins-info-backend) plugin. It offers a simple table UI that supports client-side sorting, filtering and pagination.

The plugin is designed to be installed dynamically in the [backstage-showcase](https://github.com/janus-idp/backstage-showcase/tree/main) app.

To build this plugin and the dynamic entrypoint:

`yarn install`

`yarn tsc`

`yarn build`

`yarn export-dynamic`

To install the dynamic plugin from a local build:

```bash
cd dist-scalprum
npm pack .
archive=$(npm pack $pkg)
tar -xzf "$archive" && rm "$archive"
mv package $(echo $archive | sed -e 's:\.tgz$::')
```

Move the resulting directory (`janus-idp-backstage-plugin-dynamic-plugins-info-0.1.0`) into the `dynamic-plugins-root` folder of your [backstage-showcase](https://github.com/janus-idp/backstage-showcase/tree/main) clone.

This configuration will enable the plugin to be visible in the UI:

```yaml
dynamicPlugins:
  frontend:
    janus-idp.backstage-plugin-dynamic-plugins-info:
      dynamicRoutes:
        - path: /admin/plugins
          importName: DynamicPluginsInfo
      mountPoints:
        - mountPoint: admin.page.plugins/cards
          importName: DynamicPluginsInfo
          config:
            layout:
              gridColumn: '1 / -1'
              width: 100vw
```
