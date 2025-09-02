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
    'no-unused-vars': 'warn',
    'max-len': ['error', { code: 120, ignoreUrls: true }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
};
