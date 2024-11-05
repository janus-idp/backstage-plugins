# Contributing to Janus IDP's Backstage plugins collection

✨ We would love for you to contribute to Janus IDP collection of Backstage plugins and help make it even better than it is today! ✨

As a contributor, here are the guidelines we would like you to follow:

- [Code of conduct](#code-of-conduct)
- [How can I contribute?](#how-can-i-contribute)
- [Using the issue tracker](#using-the-issue-tracker)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Coding rules](#coding-rules)
- [Compatibility with Backstage Showcase](#compatibility-with-backstage-showcase)
- [Working with the code](#working-with-the-code)

We also recommend that you read [How to Contribute to Open Source](https://opensource.guide/how-to-contribute).

## Code of conduct

Help us keep **Janus-IDP** open and inclusive. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

> [!IMPORTANT]
> We encourage users to migrate their plugins to the [backstage/community-plugins](https://github.com/backstage/community-plugins) or [redhat-developer/rhdh-plugins](https://github.com/redhat-developer/rhdh-plugins) repos. For migrating plugins to `redhat-developer/rhdh-plugins` see: [Migrating plugins to redhat-developer/rhdh-plugins](https://github.com/redhat-developer/rhdh-plugins/blob/main/CONTRIBUTING.md#using-the-cli-to-migrate-plugins-from-janus-idpbackstage-plugins) instead of this guide.

## Guide for Migrating Plugins from janus-idp/backstage-plugins to [backstage/community-plugins](https://github.com/backstage/community-plugins)

> [!NOTE]
> After fully migrating plugins, remember to check for any updates that may have been made in the `janus-idp/backstage-plugins` repository. You may need to update the migrated plugins to pull in changes made to the janus-idp/backstage-plugins repo after migration. Additionally, any unmerged PRs should be closed and recreated against the new repo.

This guide will show you how to migrate plugins from `janus-idp/backstage-plugins` to `backstage/community-plugins` using the backstage/community-plugins cli.

### Prerequisites

- Have a [janus-idp/backstage-plugins](https://github.com/janus-idp/backstage-plugins) fork locally cloned
- Have a [backstage/community-plugins](https://github.com/backstage/community-plugins) fork locally cloned

### Steps

1. In both repositories, create a new branch:

   - For `janus-idp/backstage-plugins`:

     ```bash
     git checkout -b "deprecate-workspace-name"
     ```

   - For `backstage/community-plugins`:

     ```bash
     git checkout -b "migrate-workspace-name"
     ```

2. Update the community-cli to include the `janus-plugin migrate` command. In the `backstage/community-plugins` repository, add the [`janus-migration.ts`](https://github.com/04kash/community-plugins/blob/janus-migration-script/workspaces/repo-tools/packages/cli/src/commands/plugin/janus-migration.ts) file into the following directory: `workspaces/repo-tools/packages/cli/src/commands/plugin`
   Additionally, copy the [`index.ts`](https://github.com/04kash/community-plugins/blob/janus-migration-script/workspaces/repo-tools/packages/cli/src/commands/index.ts/#L50-#L64) file into: `workspaces/repo-tools/packages/cli/src/commands/index.ts`

3. In the `backstage/community-plugins` repository, execute the janus-plugin migrate command.- Usage:`yarn community-cli janus-plugin migrate --monorepo-path [path_to_backstage_plugins]--workspace-name [workspace_name] --branch [branch_name] --maintainers [maintainer1],[maintainer2],[maintainer3],...`

   - The `path_to_backstage_plugins` is the path to the `backstage-plugins` project where the plugin(s) you want to migrate live.
   - The `workspace-name` is the name of the workspace you wish to create in the `community-plugins` project. All plugins in the `backstage-plugins` that either are exactly or start with `@janus-idp/backstage-plugin-[workspace_name]` will be migrated to this new workspace.
   - The `branch_name` is the name of the branch in the `backstage-plugins` project where the changes to add a deprecate note for the migrated plugins will be made.
   - The `maintainers` array of arguments is the github usernames of those individuals that should be listed as the maintainers for the migrated plugins. Please separate each maintainer by a comma while supplying this value.

   - example usage:

     ```bash
      yarn community-cli janus-plugin migrate --monorepo-path ../backstage-plugins --workspace-name workspace-name --branch deprecate-workspace-name --maintainers @maintainer1,@maintainer2,@maintainer3
     ```

4. The script will generate changesets in both repositories. Be sure to commit these changes and open pull requests.

> [!IMPORTANT]
> This script updates metadata commonly found across all plugins. Please review your migrated plugins to ensure that all references to "janus" have been updated to point to "community-plugins."
> Also make sure that you don't accidentally commit the `workspaces/repo-tools/packages/cli/src/commands/plugin/janus-migration.ts` or `workspaces/repo-tools/packages/cli/src/commands/index.ts` files.

5. If you run into CI issues in `community-plugins` take a look at [this github gist](https://gist.github.com/Fortune-Ndlovu/1562789f3905b4fe818b9079a3032982) which outlines the process taken to migrate argocd plugins in great detail.

6. Check if the migrated plugins need to be added to janus-idp/backstage-showcase. If they do, create a wrapper for them following the steps below:

- In `dynamic-plugins> wrappers` create a directory, name it based on your plugin (eg: `backstage-community-plugin-3scale-backend`)
- Create a `src` directory within it
- Add a `index.ts` file to this src directory and export from the plugin package here. Eg: `export * from '@backstage-community/plugin-3scale-backend';`
- In `dynamic-plugins> wrappers > backstage-community-plugin-3scale-backend` (or whatever you named your wrapper directory), add a `package.json` file. Add your plugin package in dependencies.
  - [Frontend plugin `package.json` example](https://github.com/janus-idp/backstage-showcase/blob/main/dynamic-plugins/wrappers/backstage-community-plugin-redhat-argocd/package.json)
  - [Backend plugin `package.json` example](https://github.com/janus-idp/backstage-showcase/blob/main/dynamic-plugins/wrappers/backstage-community-plugin-3scale-backend/package.json)
- run `yarn export-dynamic` to generate dist-dynamic directory

For migrating plugins to `redhat-developer/rhdh-plugins` see: [Migrating plugins to redhat-developer/rhdh-plugins](https://github.com/redhat-developer/rhdh-plugins/blob/main/CONTRIBUTING.md#using-the-cli-to-migrate-plugins-from-janus-idpbackstage-plugins)

## Next steps

Once PRs are merged in the new repo, you should [mark the old plugins deprecated, and delete the content - leaving only a README.md](https://github.com/janus-idp/backstage-plugins/pull/2482/files#diff-74b70d63dd0c250dcfdd7cacf4639fc82a1a66098d9fc2a269bb98bf89790f9fR1).

## Maintenance of older versions

As only a single version will be migrated to the new repo, maintenance of older plugins for previous RHDH releases should continue to be done in the older repo, as the migrated versions will be aligned to newer versions of Backstage and may not be compatible.

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

Familiarize yourself with the [Backstage ADRs](https://github.com/backstage/backstage/tree/master/docs/architecture-decisions) for additional guidance on best practices.

### Compatibility with Backstage Showcase

Plugin authors are responsible for migrating their plugins to ensure they run on the latest Backstage Showcase version.

1. Check the [Backstage version](https://github.com/janus-idp/backstage-showcase/blob/main/backstage.json#L2) you need to migrate to
2. Follow the [Keeping Backstage Updated](https://backstage.io/docs/getting-started/keeping-backstage-updated/) instructions

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

Each pull request consists of a **title** and a **body**

The title has a special format that includes a **type**, a **scope** and a **subject**:

```commit
<type>(<scope>): <subject>
```

#### Revert

If the commit reverts a previous commit, it should begin with `revert:`, followed by the header of the reverted commit.
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

It's also recommended to install a pre-commit hook to prevent secrets from being accidentally exposed. If you don't already have one, you can choose from a few options here: <https://pre-commit.com/hooks.html>

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

### UI Tests

Some plugins (e.g. [quay](https://github.com/janus-idp/backstage-plugins/tree/main/plugins/quay)) also have playwright-based UI tests. When making changes to such plugin, make sure these tests pass.

To run the UI tests locally, take the following steps:

First, install playwright dependencies:

```bash
$ npx playwright install --with-deps chromium
```

Finally, launch the UI tests (headless):

```bash
$ yarn run ui-test
```

Test results from the headless run will be available in `plugins/${plugin}/playwright-report` folder.

## Versioning and Publishing Plugins with Changesets

This guide outlines the process for contributing to our monorepo and publishing plugins using changesets. Changesets help us manage versioning and changelogs, especially with multiple packages.

### **Workflow**

1. **Make your changes:** Develop and test your plugin within the monorepo.
2. **Add a changeset:** Describe your changes and the desired version bump.
3. **Open a pull request:** Submit your changes for review.
4. **Merge:** Once approved, your changes will be merged.
5. **Versioning PR:** A separate automated PR will be created to bump package versions based on your changeset.
6. **Publish:** Once the Versioning PR is merged, the plugins are automatically published.

### **Adding a Changeset**

After making changes to a plugin, run the following command to add a changeset:

```bash
yarn changeset
```

This will prompt you to:

- **Select the packages to be released:** Choose the plugin(s) you modified.
- **Specify the release type:**  Choose from `patch`, `minor`, or `major` based on the semantic versioning guidelines.
- **Summarize your changes:** Provide a brief description of the changes included in the release.

### **Important Notes:**

- **Private plugins and CI changes:** Even if your changes don't affect public packages, you should still create an empty changeset using:

    ```bash
    yarn changeset add --empty
    ```

    This helps us track all modifications and ensures consistent versioning across the monorepo.
- **Changeset format:** Follow the conventional commit format for your changeset summaries. This improves readability and helps with automated changelog generation.
- **Review process:** During the review process, ensure your changeset accurately reflects the modifications made in your pull request.

### **Example Changeset Summary:**

```md
feat(my-plugin): add new feature X

This change introduces a new feature to the my-plugin package, allowing users to do Y.
```

### **Backporting Changes**

Changesets are enabled on release branches to facilitate backporting. However, there is a caveat:

- **Manual Retagging:** After a backported plugin is published, the publish action may overwrite the latest plugin version with the backported version. To fix this, you need to manually retag the latest plugin version on NPM.

#### **To retag a plugin:**

1. Ensure you have the correct permissions on NPM. If you don't, please reach out to Nick Boldt or Kim Tsao.
2. Run the following command, replacing `<plugin name>` and `<latest plugin version>` with the appropriate values:

    ```bash
    npm dist-tag add @janus-idp/<plugin name>@<latest plugin version e.g. 1.2.3> latest
    ```

This will update the npm tag to point to the latest version.

### Plugin Ownership and Responsibilities**

#### **Publishing:**

- **Main Branch:** The plugins team is responsible for merging the versioning PR to publish plugins.
- **Release Branches:** The security team is responsible for merging the versioning PR to publish plugins.

#### **Version Compatibility:**

- **Main Branch:** The plugins team is responsible for ensuring RHDH uses the latest compatible plugin versions. Exception: Backstage version bumps are handled by the core platform team.  **Note:** Plugins should not depend on a newer version of Backstage than what RHDH allows.
- **Release Branches:** The security team is responsible for ensuring RHDH uses the latest compatible plugin versions.

## Creating new plugins - DEPRECATED

**As of June 2024, new plugins should be contributed to the new [Backstage Community Plugins](https://github.com/backstage/community-plugins/blob/main/CONTRIBUTING.md#get-started) repo.**

**The rest of this section is DEPRECATED and will be removed in future.**

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

4. Run `yarn dev`

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
