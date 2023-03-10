module.exports = require('@backstage/cli/config/eslint-factory')(__dirname, {
  rules: {
    'react-hooks/rules-of-hooks': [
      'error',
      {
        additionalHooks: '(useAsync|useAsync)',
      },
    ],
    'react-hooks/exhaustive-deps': [
      'error',
      {
        additionalHooks: '(useAsync|useAsyncFn)',
      },
    ],
  },
});
