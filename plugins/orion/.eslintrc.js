module.exports = require('@backstage/cli/config/eslint-factory')(__dirname, {
  rules: {
    'react-hooks/rules-of-hooks': [
      'error',
      {
        additionalHooks: '(useIsomorphicLayoutEffect|useAsync)',
      },
    ],
    'react-hooks/exhaustive-deps': [
      'error',
      {
        additionalHooks: '(useIsomorphicLayoutEffect|useAsyncFn)',
      },
    ],
  },
});
