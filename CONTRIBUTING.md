# Contributing to Janus IDP's Backstage plugins collection

✨ We would love for you to contribute to Janus IDP collection of Backstage plugins and help make it even better than it is today! ✨

As a contributor, here are the guidelines we would like you to follow:

- [Code of conduct](#code-of-conduct)
- [How can I contribute?](#how-can-i-contribute)
- [Using the issue tracker](#using-the-issue-tracker)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Coding rules](#coding-rules)
- [Working with the code](#working-with-the-code)

We also recommend that you read [How to Contribute to Open Source](https://opensource.guide/how-to-contribute).

## Code of conduct

Help us keep **Janus-IDP** open and inclusive. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## How can I contribute?

### Improve documentation

As a **Janus-IDP** user, you are the perfect candidate to help us improve our documentation: typo corrections, clarifications, more examples, etc. Take a look at the [documentation issues that need help](https://github.com/janus-idp/backstage-plugins/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3Akind%2Fdocumentation).

Please follow the [Documentation guidelines](#documentation).

### Give feedback on issues

Issues that lack relevant information can be very difficult to track down and fix, please follow the [Bug report guideline](#bug-report) to help make them easier to resolve.
Help make them easier to resolve by adding any relevant information.

### Fix bugs and implement features

Confirmed bugs and ready-to-implement features are marked with the [help wanted label](https://github.com/janus-idp/backstage-plugins/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22help+wanted%22).
Post a comment on an issue to indicate you would like to work on it and to request help from the [@janus-idp/maintainers-plugins](https://github.com/orgs/janus-idp/teams/maintainers-plugins) and the community.

## Using the issue tracker

Before opening an issue or a Pull Request, please use the [GitHub issue search](https://github.com/janus-idp/backstage-plugins/issues) to make sure the bug or feature request hasn't been already reported or fixed.

### Bug report

A good bug report shouldn't leave others needing to chase you for more information.
Please try to be as detailed as possible in your report and fill in the information requested in the [bug report template](https://github.com/janus-idp/backstage-plugins/issues/new?labels=kind%2Fbug%2Cstatus%2Ftriage&projects=janus-idp/2&template=bug_report.md).

### Feature request

Feature requests are welcome, but take a moment to find out whether your idea fits with the scope and aims of the project.
It's up to you to make a strong case to convince the project's developers of the merits of this feature.
Please provide as much detail and context as possible and fill in the information requested in the [feature request template](https://github.com/janus-idp/backstage-plugins/issues/new?labels=kind%2Fenhancement%2Cstatus%2Ftriage&projects=janus-idp/2&template=enhancement.md).

### New plugin request

Plugins are a great way to extend Backstage capabilities and are an integral part of this repository.
Please provide as much detail and context as possible and fill the information requested in the [plugin suggestion template](https://github.com/janus-idp/backstage-plugins/issues/new?labels=plugin%2Cstatus%2Ftriage&projects=janus-idp/2&template=plugin.yaml&title=%F0%9F%94%8C+Plugin%3A+).

## Submitting a Pull Request

Good pull requests, whether patches, improvements, or new features, are a fantastic help.
They should remain focused in scope and avoid containing unrelated commits.

**Please ask first** before embarking on any significant pull requests (e.g. implementing features, refactoring code), otherwise you risk spending a lot of time working on something that the project's maintainers might not want to merge into the project.

If you have never created a pull request before, welcome 🎉 😄.
[Here is a great tutorial](https://opensource.guide/how-to-contribute/#opening-a-pull-request) on how to create one 🙂

Here is a summary of the steps to follow:

1. [Set up the workspace](#set-up-the-workspace)
2. If you cloned a while ago, get the latest changes from upstream and update dependencies:

```bash
$ git checkout main
$ git pull upstream main
$ yarn install
```

3. Create a new topic branch (off the main project development branch) to contain your feature, change, or fix:

```bash
$ git checkout -b <topic-branch-name>
```

4. Make your code changes, following the [Coding rules](#coding-rules)
5. Push your topic branch up to your fork:

```bash
$ git push origin <topic-branch-name>
```

6. [Open a Pull Request](https://help.github.com/articles/creating-a-pull-request/#creating-the-pull-request) with a clear title and description.

**Tips**:

- For ambitious tasks, open a Pull Request as soon as possible with the `[WIP]` prefix in the title, in order to get feedback and help from the community.
- [Allow Janus-IDP maintainers to make changes to your Pull Request branch](https://help.github.com/articles/allowing-changes-to-a-pull-request-branch-created-from-a-fork).
  This way, we can rebase it and make some minor changes if necessary.
  All changes we make will be done in the new commit, and we'll ask for your approval before merging them.

## Coding rules

### Source code

To ensure consistency and quality throughout the source code, all code modifications must have:

- No [linting](#lint) errors
- A [test](#tests) for every possible case introduced by your code change
- **100%** test coverage
- [Valid commit message(s)](#commit-message-and-pull-request-guidelines)
- Documentation for new features
- Updated documentation for modified features

### Style and conventions

While our linter configuration already cover most of the code styling, it is not always helpful when it comes how the code should be structured. Here's a list of few conventions we follow according to file names, and folder structure:

1. Backstage plugins and supporting libraries live inside the `plugins` folder. Each plugin has its own folder named after the plugin id. For example, the `@janus-idp/backstage-plugin-topology` plugin lives inside the `plugins/topology` folder.
2. `packages` folder contains all NPM packages that are not `plugin` related. For example, a local backstage instance lives inside the `packages/app` and `packages/backend` folders. Additionally the `@janus-idp/janus-cli` package lives inside the `packages/janus-cli` folder since this is not a plugin.
3. Plugin names are always prefixed with `@janus-idp/backstage-plugin-` and the plugin id. For example, the `@janus-idp/backstage-plugin-topology` plugin has the `topology` id. Please always use `yarn new` when creating a new plugin. It will guide you through the process and ensure the plugin id is used consistently.
4. Each plugin contains a `dev` folder. This is folder is used for development setup. Please try to make your plugin development self-contained so you don't have to rely on changes in `packages` folder. This is not always possible, but we try to keep the `packages` folder as clean as possible.
5. Each plugin contains a `README.md`. This file contains the user facing documentation. Please follow the [Documentation guidelines](#documentation) when writing documentation.
6. Each plugin contains a `CONTRIBUTING.md`. This file contains the plugin contributor and developer documentation. Please follow the [Documentation guidelines](#documentation) when writing documentation.
7. Within `src` folder there are various additional folders depending on your plugin role. We follow following convention:
   - `api` folder contains API clients for third party services
   - `components` folder contains React components exposed from the plugin
   - `hooks` folder contains React hooks
   - `lib` folder contains all other code that is not exposed from the plugin, helper utilities etc.
   - `service` folder contains the plugin backend service. This is most commonly a Backstage sub-router that is then exposed via the Backstage backend API
   - `providers` folder contains the plugin's entity providers exposed from the plugin
   - `actions` folder contains GPT/Scaffolder actions exposed from the plugin

### Documentation

To ensure consistency and quality, all documentation modifications must:

- Refer to brand in [bold](https://help.github.com/articles/basic-writing-and-formatting-syntax/#styling-text) with proper capitalization, i.e. **GitHub**, **Red Hat**, **Backstage**, **npm**
- Prefer [tables](https://help.github.com/articles/organizing-information-with-tables) over [lists](https://help.github.com/articles/basic-writing-and-formatting-syntax/#lists) when listing key values, i.e. List of options with their description
- Use [links](https://help.github.com/articles/basic-writing-and-formatting-syntax/#links) when you are referring to:
  - a **Janus-IDP** concept described somewhere else in the documentation, i.e. How to [contribute](CONTRIBUTING.md)
  - a third-party product/brand/service, i.e. Integrate with [GitHub](https://github.com)
  - an external concept or feature, i.e. Create a [GitHub release](https://help.github.com/articles/creating-releases)
  - a package or module, i.e. The [`@janus-idp/backstage-plugin-topology`](https://github.com/janus-idp/backstage-plugins/tree/main/plugins/topology) module
- Use the [single backtick `code` quoting](https://help.github.com/articles/basic-writing-and-formatting-syntax/#quoting-code) for:
  - commands inside sentences, i.e. the `yarn new` command
  - programming language keywords, i.e. `function`, `async`, `String`
  - packages or modules, i.e. The [`@janus-idp/backstage-plugin-topology`](https://github.com/janus-idp/backstage-plugins/tree/main/plugins/topology) module
- Use the [triple backtick `code` formatting](https://help.github.com/articles/creating-and-highlighting-code-blocks) for:
  - code examples
  - configuration examples
  - sequence of command lines

When adding a new plugin, provide a clear guide into how to use it. This includes:

- Installation instructions
- Development setup, including how to set up all necessary third party integrations
- Comprehensively describe all available configuration options
- Screenshots or Videos showcasing UI elements of the plugin

### Commit message and Pull request guidelines

We do not enforce strict commit message guidelines, instead we resort to Atomic PRs and [Squash and merge strategy](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/about-pull-request-merges#squash-and-merge-your-commits) to ensure that the commit history is clean and readable. However please keep in mind that your individual commit messages will be visible in the PR history and will be used to generate the commit message of the final merge commit. Therefore please keep the following guidelines in mind when writing commit messages and refrain from meaningless, non-descriptive commit messages like "update" or "fix issues", etc.

#### Atomic commits

If possible, make [atomic commits](https://en.wikipedia.org/wiki/Atomic_commit), which means:

- a commit should contain exactly one self-contained functional change
- a functional change should be contained in exactly one commit
- a commit should not create an inconsistent state (such as test errors, linting errors, partial fixes, feature with documentation, etc.)

A complex feature can be broken down into multiple commits as long as each one maintains a consistent state and consists of a self-contained change.

#### Commit message format

Following these guidelines for committing messages is optional but strongly encouraged.

Each commit message consists of a **header** and a **body**.
The header has a special format that includes a **type**, a **scope** and a **subject**:

```commit
<type>(<scope>): <subject>
<BLANK LINE>
<body>
```

The **header** is mandatory and the **scope** of the header is optional.

The **body** can contain a [closing reference to an issue](https://help.github.com/articles/closing-issues-via-commit-messages).

#### Pull Request message format

Following these guidelines for Pull Request messages is **required** and will be enforced by the CI. This is a strong prerequisite for our [release automation](#releasing-changes).

Each pull request consists of a **title** and a **body**

The title has a special format that includes a **type**, a **scope** and a **subject**:

```commit
<type>(<scope>): <subject>
```

#### Revert

If the commit reverts a previous commit, it should begin with `revert: `, followed by the header of the reverted commit.
The body should say: `This reverts commit <hash>.`, where the hash is the SHA of the commit being reverted.

#### Type

The type must be one of the following:

| Type         | Description                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| **fix**      | A bug fix                                                                                              |
| **feat**     | A new feature                                                                                          |
| **chore**    | A change that doesn't affect package codebase but rather the tooling around                            |
| **docs**     | Documentation only changes                                                                             |
| **style**    | Changes that do not affect the meaning of the code (white space, formatting, missing semicolons, etc.) |
| **refactor** | A code change that neither fixes a bug nor adds a feature                                              |
| **perf**     | A code change that improves performance                                                                |
| **test**     | Adding missing tests or correcting existing tests                                                      |
| **revert**   | Reverts a given commit                                                                                 |

Type can contain optional **scope** and **!** to mark breaking changes. Please use **scope** to denote the affected plugin or package.

#### Subject

The subject contains a succinct description of the change:

- use the imperative, present tense: "change" not "changed" nor "changes"
- don't capitalize the first letter
- no dot (.) at the end

#### Body

Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes".
The body should include the motivation for the change and contrast this with previous behavior.

It should contain any information about **Breaking Changes** and is also the place to reference GitHub issues that this commit **Closes**.

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines.
The rest of the commit message is then used for this.

#### Examples

```commit
fix(pencil): stop graphite breaking when too much pressure applied
```

```commit
feat(pencil): add 'graphiteWidth' option

Fix #42
```

```commit
perf(pencil)!: remove graphiteWidth option

BREAKING CHANGE: The graphiteWidth option has been removed.

The default graphite width of 10mm is always used for performance reasons.
```

## Working with the code

### Set up the workspace

[Fork](https://guides.github.com/activities/forking/#fork) the project, [clone](https://guides.github.com/activities/forking/#clone) your fork, configure the remotes and install the dependencies:

```bash
# Clone your fork of the repo into the current directory
$ git clone git@github.com:$(gh config get user -h github.com)/backstage-plugins.git
# Navigate to the newly cloned directory
$ cd backstage-plugins
# Assign the original repo to a remote called "upstream"
$ git remote add upstream git@github.com:janus-idp/backstage-plugins.git
# Install the dependencies
$ yarn install
```

The Backstage has multiple dependencies. To pass through their installation, make sure to follow the [isolated-vm](https://github.com/laverdet/isolated-vm#requirements) requirements.

### Lint

The [backstage-plugins](https://github.com/janus-idp/backstage-plugins) repository use [ESLint](https://eslint.org/) for linting and [Prettier](https://prettier.io) for formatting.

Formatting will be automatically verified and fixed by `lint-staged` on the commit.

Before pushing your code changes make sure there are no linting errors with `yarn lint` and `yarn prettier:check`.

**Tips**:

- Most linting errors can be automatically fixed with `yarn prettier:fix`.

### Tests

The [backstage-plugins](https://github.com/janus-idp/backstage-plugins) repository uses [Jest](https://jestjs.io/) for writing and running tests.

Before pushing your code changes make sure all **tests pass** and the **coverage is 100%**:

```bash
$ yarn test
```

## Releasing changes

This repository defaults to a rapid release scheme where we would rather release on every PR merge than restrict ourselves by a strict release cadence and policy. This brings contributors the opportunity to see the direct impact of their contributions since they are released immediately after the merge. The release process itself is done via the [semantic-release](https://semantic-release.gitbook.io/semantic-release/) tool. In order for it to work properly, it requires contributors to follow a simple set of rules:

1. Never bump the package version manually yourself. `semantic-release` will calculate the appropriate version change and do it for you.
2. Do not hesitate to update multiple packages in a single PR. [multi-semantic-release](https://github.com/dhoulb/multi-semantic-release) will take care of it, and release a new version for all of them while updating their cross-dependencies accordingly.

### Release workflow

Semantic Release does the following:

1. Analyze commits for each package to determine if a release is necessary (if there are changes in the package)
2. Generates `CHANGELOG.md` for each package to be released
3. Bump the version number in the `package.json` for each package
4. Creates a git tag `<package-name>@<version>` pointing to the new release
5. Create a new GitHub release for each package
6. Publishes the new version to the NPM registry

### Version changes guidelines

**semantic-release** uses the Pull request title to determine the consumer impact of changes in the codebase.
Following formalized conventions for Pull request title messages, **semantic-release** automatically determines the next [semantic version](https://semver.org) number, generates a changelog, and publishes the release. Please read the [pull request message format](#pull-request-message-format) section for more details.

The table below shows which Pull Request titles get you which release:

| Release type                         | Type and scope that triggers it                                                                                     | Commit message example                                      |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| ~~Patch~~ `vX.Y.🆙` Fix Release      | Type must be `fix`, `docs`, `refactor`, `style`, `revert` or `chore(deps)` (in this case the scope must match)      | `fix(topology): fix pipelinerun status icon color`          |
| ~~Minor~~ `vX.🆙.0` Feature Release  | Type must be `feat`, `perf`                                                                                         | `feat(kiali): add namespace selector`                       |
| ~~Major~~ `v🆙.0.0` Breaking Release | `<type>(<optional-scope>)!: <message>` Notice the `!` token. It must be present. The type and scope are irrelevant. | `feat(ocm)!: Relocate OCM config and support multiple hubs` |
| No release                           | Type `chore` (except when the scope is `deps`), or for any type when the scope is `no-release`                      |

## Creating new plugins

A particular case of contribution is implementing a new plugin. Before you start implementing a new one, please consult our issue tracker and make a [New plugin request](#new-plugin-request). Once you have a green light from the community, you can start implementing your plugin.

Start by running our plugin template wizard:

```bash
yarn new
```

This will lead you through plugin category selection and set up all the required boilerplate. By default, this will only create a new standalone plugin within the `plugins` folder and will not touch the `packages` folder where we host an empty Backstage instance. You can bypass this behavior by running `janus-cli new` directly instead, but we discourage it. We aim to enable a standalone, self-contained plugin development workspace, however this is not fully possible at this moment.

This interactive wizard will lead you through the process of creating a new plugin. It will ask you for the following information:

1. **Plugin type**
   You are offered a choice from the following options:

| Option            | Description                                                                           | Package name                                                  | Folder name                               |
| ----------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------- |
| plugin            | A new frontend plugin. React-based frontend plugin.                                   | `@janus-idp/backstage-plugin-<ID>`                            | `plugins/<ID>`                            |
| backend-plugin    | A new backend plugin. Plugin to the Node.js Express server.                           | `@janus-idp/backstage-plugin-<ID>-backend`                    | `plugins/<ID>-backend`                    |
| scaffolder-module | An module exporting custom actions for `@backstage/plugin-scaffolder-backend`         | `@janus-idp/backstage-plugin-scaffolder-backend-module-<ID>`  | `plugins/scaffolder-backend-module-<ID>`  |
| plugin-common     | A new isomorphic common plugin package. Serves as an interface between other plugins. | `@janus-idp/backstage-plugin-<ID>-common`                     | `plugins/<ID>-common`                     |
| backend-module    | A new backend module                                                                  | `@janus-idp/backstage-plugin-<ID>-backend-module-<MODULE_ID>` | `plugins/<ID>-backend-module-<MODULE_ID>` |
| web-library       | A new web-library package. **Currently not used**                                     | `@janus-idp/backstage-<ID>`                                   | `packages/<ID>`                           |
| plugin-node       | A new Node.js library plugin package. **Currently not used**                          | `@janus-idp/backstage-plugin-<ID>-node`                       | `plugins/<ID>-node`                       |
| plugin-react      | A new web library plugin package. **Currently not used**                              | `@janus-idp/backstage-plugin-<ID>-react`                      | `plugins/<ID>-react`                      |

2. **Plugin id**: This value is used in templating and determines the resulting package name and folder name. Please see the table above and look where the `<ID>` is used. As you can see, you don't have to specify the plugin role within the ID value, the role is added to the package name automatically.

Once you finish bootstrapping your plugin folder, please look up the upstream documentation. For example:

- [The structure of a plugin](https://backstage.io/docs/plugins/structure-of-a-plugin)
- For frontend plugins, see the general [plugin development guide](https://backstage.io/docs/plugins/plugin-development) and [composability system](https://backstage.io/docs/plugins/composability).
- For backend plugins, see the backend specific [plugin development guide](https://backstage.io/docs/plugins/backend-plugin/).

### Develop a new plugin together with a local backstage instance

Backstage's support for standalone plugin development is minimal (especially for backend plugins), therefore we include a minimal test instance within this repository.

1. Install the plugin via `yarn workspace [app|backend] add @janus-idp/<PLUGIN_NAME>@*`
   - Example: `yarn workspace app add "@janus-idp/backstage-plugin-nexus-repository-manager@*"`
   - `@*` at the end ensures the package is always linked to the local package in the `plugins` folder
2. Follow the plugin's install instructions
3. (Optional) Tell git to assume the modified files are unchanged, so that
   status/diff commands are representative of your current work:
   ```shell
   # Example, list any dev app files where you don't want changes tracked
   git update-index --assume-unchanged \
       app-config.yaml \
       packages/app/package.json \
       packages/app/src/components/catalog/EntityPage.tsx
   ```
4. Run `yarn start:backstage`

### Standalone standalone plugin development

In case your plugin supports standalone mode, you can use `yarn start --filter=<PLUGIN_NAME>` command in your plugin directory directly and you don't have to install the plugin as mentioned above.

### Existing plugin contributions

If you want to start contributing to a plugin you're not yet familiar with, always consult its `CONTRIBUTING.md` file within its folder in `plugins/`. This file contains all the information you need to know about that particular plugin's development setup.

### Plugin-specific config file

You can augment the configuration for a plugin by running `yarn start --config <CONFIG_FILE>`.

### Common issues

- Error:

  ```log
  ERROR run failed: error preparing engine: Invalid persistent task configuration:
  You have <x - number> persistent tasks but `turbo` is configured for concurrency of 10. Set --concurrency to at least <x - number>
  ```

Solution: You need to run `yarn start` with a [filter](https://turbo.build/repo/docs/core-concepts/monorepos/filtering). e.g. `yarn start --filter=<PLUGIN_NAME>`
