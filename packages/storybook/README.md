# Storybook

_This package was created through the Backstage CLI_.  
It provides a playground for testing and developing UI components in isolation.

## Usage

From the root workspace run:

```sh
yarn start:storybook [plugins/<frontend-plugin-name>]
```

### Notes:

1. If no `plugins/<plugin-name>` is passed, the process will scan for stories inside each plugin workspace.
2. To make a build of Storybook use: `yarn build:storybook [plugins/<frontend-plugin-name>]`.
   This command produces a directory called `packages/storybook/storybook-static`. This directory can be then rendered
   using a static web server.
