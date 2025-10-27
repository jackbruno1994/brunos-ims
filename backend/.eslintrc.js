module.exports = {
  extends: ['eslint:recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  rules: {
    // General rules
    'prefer-const': 'error',
    'no-var': 'error',
    'no-unused-vars': 'off', // Disable for TypeScript
  },
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
};
