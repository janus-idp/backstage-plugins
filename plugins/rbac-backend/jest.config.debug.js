module.exports = {
  projects: [
    {
      displayName: 'rbac-backend',
      testMatch: ['<rootDir>/**/*.test.ts'],
      preset: 'ts-jest',
      testEnvironment: 'node',
      transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: './tsconfig.debug.json' }],
      },
    },
  ],
};
