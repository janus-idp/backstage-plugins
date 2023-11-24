import type { StorybookConfig } from '@storybook/react-webpack5';
import type { Configuration } from 'webpack';

import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, 'package.json')));
}

function makeSwcLoaderOptionsWithSyntax(syntax: 'typescript' | 'ecmascript') {
  return {
    jsc: {
      target: 'es2019',
      parser: {
        syntax,
        tsx: true,
        dynamicImport: true,
      },
      transform: {
        react: {
          runtime: 'automatic',
        },
      },
    },
  };
}

/**
 * This function replaces `babel-loader` with `swc-loader` for handling `.[jt]sx?` files.
 * @note The `babel-loader` configuration in Storybook doesn't support relatively
 * new TypeScript features (e.g. the `satisfies` keyword). Although, using
 * https://babeljs.io/docs/babel-plugin-transform-typescript can yield the same results, SWC is faster
 * (source: https://swc.rs/blog/perf-swc-vs-babel) and it requires less configuration boilerplate.
 */
function replaceBabelLoaderWithSwcLoader(webpackConfig: Configuration) {
  const indexOfRuleUsingBabelLoader = 2;
  if (!webpackConfig.module)
    throw new Error('Missing `module` property in Webpack configuration');
  if (!webpackConfig.module.rules)
    throw new Error('Missing `rules` property in Webpack configuration');

  const { rules } = webpackConfig.module;
  rules.splice(indexOfRuleUsingBabelLoader, 1);
  rules.push(
    {
      test: /\.(tsx?)$/,
      exclude: /node_modules/,
      loader: require.resolve('swc-loader'),
      options: makeSwcLoaderOptionsWithSyntax('typescript'),
    },
    {
      test: /\.(jsx?)$/,
      exclude: /node_modules/,
      loader: require.resolve('swc-loader'),
      options: makeSwcLoaderOptionsWithSyntax('ecmascript'),
    },
  );

  return webpackConfig;
}

/**
 * Calling storybook with no args renders all the stories in the plugins directory.
 * This is OK if we are making a build of storybook, but for local development it doesn't scale well.
 * This function allows passing storybook a specific plugins workspace, in order to render only the stories from that
 * specific workspace.
 * @example yarn start:storybook plugins/orchestrator
 * @note The same applies for the `build` command (`yarn build:storybook <plugins/dir>`)
 */
function createConfig(args: string[]): StorybookConfig {
  const lastCliArg = args.at(-1);
  const rootDir = resolve(__dirname, '../../..');
  const storiesFileExtensions = '*.stories.@(js|jsx|mjs|ts|tsx)';
  const mdxFileExtensions = '*.mdx';
  const pluginsDirNameRegExp = /plugins\/(\d|\w|\s|-|_)+/;
  const storybookConfig: StorybookConfig = {
    stories: [],
    addons: [
      getAbsolutePath('@storybook/addon-links'),
      getAbsolutePath('@storybook/addon-essentials'),
      getAbsolutePath('@storybook/addon-interactions'),
    ],
    framework: {
      name: getAbsolutePath(
        '@storybook/react-webpack5',
      ) as '@storybook/react-webpack5',
      options: {
        fastRefresh: true,
      },
    },
    docs: {
      autodocs: 'tag',
    },
    core: {
      disableTelemetry: true,
    },
    webpackFinal: async webpackConfig =>
      replaceBabelLoaderWithSwcLoader(webpackConfig),
  };

  if (lastCliArg && pluginsDirNameRegExp.test(lastCliArg)) {
    const pluginDir = join(rootDir, lastCliArg);
    if (existsSync(pluginDir)) {
      // Include only the stories in the given plugin workspace
      storybookConfig.stories.push(
        `${pluginDir}/src/**/${mdxFileExtensions}`,
        `${pluginDir}/src/**/${storiesFileExtensions}`,
      );
    } else {
      throw new Error(`${pluginDir} is not a plugin directory`);
    }
  } else {
    // Include all the stories in the plugins workspace
    storybookConfig.stories.push(
      `${rootDir}/plugins/*/src/**/${mdxFileExtensions}`,
      `${rootDir}/plugins/*/src/**/${storiesFileExtensions}`,
    );
  }

  return storybookConfig;
}

export default createConfig(process.argv.slice(2));
