const defaults = require('@backstage/cli/config/eslint-factory')(__dirname);

module.exports = {
  ...defaults,
  overrides: [
    {
      files: ['*.cy.js'],
      rules: {
        'jest/expect-expect': 'off',
      },
    },
  ],
};
