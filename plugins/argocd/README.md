# argocd

Welcome to the argocd plugin!

_This plugin was created through the Backstage CLI_

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/argocd](http://localhost:3000/argocd).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.

## Loading as Dynamic Plugin

This plugin can be loaded in backstage showcase application as a dynamic plugin.

Follow the below steps -

- Export dynamic plugin assets. This will build and create the static assets for the plugin and put it inside dist-scalprum folder.

```sh
yarn export-dynamic
```

- Package and copy dist-scalprum folder assets to dynamic-plugins-root folder in showcase application.

```sh
pkg=../plugins/argocd
archive=$(npm pack $pkg)
tar -xzf "$archive" && rm "$archive"
mv package $(echo $archive | sed -e 's:\.tgz$::')
```

- Add the extension point inside the app-config.yaml or app-config.local.yaml file.

```yaml
dynamicPlugins:
  frontend:
    janus-idp.backstage-plugin-argocd:
      mountPoints:
        - mountPoint: entity.page.cd/cards
          importName: ArgocdPage
          config:
            layout:
              gridColumn: '1 / -1'
            if:
              anyOf:
                - hasAnnotation: backstage.io/kubernetes-id
                - hasAnnotation: backstage.io/kubernetes-namespace
```

For more detailed explanation on dynamic plugins follow this [doc](https://github.com/janus-idp/backstage-showcase/blob/main/showcase-docs/dynamic-plugins.md).
