# AppNext

This package is an experimental package on how build the backstage UI using dynamic UI plugins and the new backstage declarative UI system.

The declarative UI system is still in development. APIs will likely change and not all backstage plugins are compatible with the new system.

## How to start

1. run `yarn` command in repository root to install all dependencies
2. go to `plugins/plugins/dynamic-frontend-plugin`
3. build the dynamic plugin with `yarn build` command
4. once the plugin is build, serve the `dist-scalprum` directory via simple http server:

```
npx http-server ./dist-scalprum/ -p 8004 --cors=* --cache=-1
```

5. keep the server running and open a new terminal inside the `packages/app-next` directory
6. run the `yarn start` command
7. new browser window should open at `http://localhost:3000/`

## What is dynamic

Currently there are a few dynamic pages available in the demo.

### Scalprum dynamic page

This is a sample page with a dynamic UI that is not using any backstage integration. It was created to test the integration wit scalprum

### GraphiQL and Tech radar pages

These pages dynamically load plugins that were already migrated to the new declarative UI system

### user settings page

This is an example of a rebuild if an existing "legacy" plugin that is not yet compatible with the new declarative UI system. Most of the features do not work on this page.

## What is next

We will now experiment with integration to the current UI system (not using the declarative UI) and how we can provide dynamic UI plugins that are compatible with the current and the upcoming UI systems.
