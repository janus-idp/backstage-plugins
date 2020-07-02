/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = {
  extends: [
    '@spotify/eslint-config-base',
    '@spotify/eslint-config-typescript',
    'prettier',
    'prettier/@typescript-eslint',
    'plugin:jest/recommended',
    'plugin:monorepo/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['import'],
  env: {
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  ignorePatterns: ['.eslintrc.js', '**/dist/**'],
  rules: {
    'no-console': 0, // Permitted in console programs
    'new-cap': ['error', { capIsNew: false }], // Because Express constructs things e.g. like 'const r = express.Router()'
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'warn',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: false,
        optionalDependencies: true,
        peerDependencies: true,
        bundledDependencies: true,
      },
    ],
    'no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-expressions': 'error',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { vars: 'all', args: 'after-used', ignoreRestSiblings: true },
    ],
    // Avoid cross-package imports
    'no-restricted-imports': [2, { patterns: ['**/../../**/*/src/**'] }],
  },
  overrides: [
    {
      files: ['*.test.*', 'src/setupTests.*', 'dev/**'],
      rules: {
        // Tests are allowed to import dev dependencies
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: true,
            optionalDependencies: true,
            peerDependencies: true,
            bundledDependencies: true,
          },
        ],
      },
    },
  ],
};
