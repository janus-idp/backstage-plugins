const path = require('path');
const editorAssets = require('@kie-tools/serverless-workflow-diagram-editor-assets');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const envelopeFolderName = 'workflow-editor-envelope';

module.exports = env => {
  return {
    mode: 'production',
    optimization: {
      splitChunks: {
        cacheGroups: {
          monacoEditorMin: {
            test: /[\\/]node_modules[\\/]monaco-editor/,
            name: 'monaco-editor',
            chunks: 'async',
          },
        },
      },
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              comments: false,
            },
          },
          extractComments: false,
        }),
      ],
    },
    performance: {
      maxEntrypointSize: 1024 * 1024 * 15,
      maxAssetSize: 1024 * 1024 * 15,
    },
    entry: {
      'serverless-workflow-diagram-editor-envelope': path.resolve(
        './workflow-editor-envelope/ServerlessWorkflowDiagramEditorEnvelopeApp.ts',
      ),
      'serverless-workflow-combined-editor-envelope': path.resolve(
        './workflow-editor-envelope/ServerlessWorkflowCombinedEditorEnvelopeApp.ts',
      ),
      'serverless-workflow-text-editor-envelope': path.resolve(
        './workflow-editor-envelope/ServerlessWorkflowTextEditorEnvelopeApp.ts',
      ),
    },
    plugins: [
      new FileManagerPlugin({
        events: {
          onEnd: [
            {
              // Default copy assets to `dist` folder
              copy: [
                prepareCopyInfoForStaticHtmlFiles(
                  `./dist/${envelopeFolderName}/`,
                ),
                prepareCopyInfoForDiagramFolder(`./dist/${envelopeFolderName}`),
              ],
            },
            // Copy based on env `envelopeParentFolder`, if provided
            prepareCopyFreshEnvelope(env?.envelopeParentFolder),
          ],
        },
      }),
      new MonacoWebpackPlugin({
        languages: ['json'],
        customLanguages: [
          {
            label: 'yaml',
            entry: ['monaco-yaml', 'vs/basic-languages/yaml/yaml.contribution'],
            worker: {
              id: 'monaco-yaml/yamlWorker',
              entry: 'monaco-yaml/yaml.worker.js',
            },
          },
        ],
      }),
    ],
    module: {
      rules: [
        {
          test: /\.(tsx|ts)?$/,
          include: [path.resolve('./workflow-editor-envelope')],
          use: [
            {
              loader: 'ts-loader',
              options: {
                configFile: path.resolve('./tsconfig.json'),
                allowTsInNodeModules: true,
              },
            },
          ],
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            require.resolve('style-loader'),
            require.resolve('css-loader'),
            require.resolve('sass-loader'),
          ],
        },
        {
          test: /\.css$/,
          use: [require.resolve('style-loader'), require.resolve('css-loader')],
        },
        {
          test: /\.(svg|ttf|eot|woff|woff2)$/,
          type: 'asset/inline',
        },
      ],
    },
    output: {
      path: path.resolve('./dist/workflow-editor-envelope'),
      filename: '[name].js',
      chunkFilename: '[name].bundle.js',
    },
    resolve: {
      fallback: {
        path: require.resolve('path-browserify'),
      },
    },
  };
};

function prepareCopyInfoForDiagramFolder(context) {
  return {
    source: editorAssets.swEditorPath(),
    destination: path.resolve(`${context}/diagram`),
    options: {
      globOptions: { ignore: ['**/WEB-INF/**/*'] },
    },
  };
}

function prepareCopyInfoForStaticHtmlFiles(context) {
  return {
    source: path.resolve(`./${envelopeFolderName}/*.html`),
    destination: path.resolve(context),
  };
}

function prepareCopyInfoForDistJsFiles(context) {
  return {
    source: path.resolve(`./dist/${envelopeFolderName}/*.js`),
    destination: path.resolve(context),
  };
}

function prepareCopyFreshEnvelope(envelopeParentFolder) {
  if (!envelopeParentFolder) {
    return {};
  }

  const context = path.resolve(envelopeParentFolder, envelopeFolderName);

  return {
    delete: [
      {
        source: context,
        options: {
          force: true,
        },
      },
    ],
    mkdir: [context],
    copy: [
      prepareCopyInfoForStaticHtmlFiles(context),
      prepareCopyInfoForDiagramFolder(context),
      prepareCopyInfoForDistJsFiles(context),
    ],
  };
}
