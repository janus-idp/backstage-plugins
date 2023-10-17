# Setting up the development environment for Tekton plugin

In [Backstage plugin terminology](https://backstage.io/docs/local-dev/cli-build-system#package-roles), the Tekton plugin is a front-end plugin. You can start a live development session from the repository root using the following command:

```console
yarn workspace @janus-idp/backstage-plugin-tekton run start
```

There are also e2e tests that can run against this development session. After running the above command, run:

```console
yarn workspace @janus-idp/backstage-plugin-tekton run cypress open
```

to start the interactive development environment or:

```console
yarn workspace @janus-idp/backstage-plugin-tekton run cypress run
```

to just execute the tests. The e2e tests can also be kicked off in one command where a backend will be started automatically by running:

```console
yarn workspace @janus-idp/backstage-plugin-tekton run e2e
```
