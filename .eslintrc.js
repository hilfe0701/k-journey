// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: 'expo',
  ignorePatterns: [
    '/dist/*',
    'node_modules',
    '.expo',
    'ios',
    'android',
  ],
  overrides: [
    {
      files: ['**/__tests__/**/*.{ts,tsx,js,jsx}', 'jest.setup.js'],
      env: { jest: true },
    },
  ],
};
