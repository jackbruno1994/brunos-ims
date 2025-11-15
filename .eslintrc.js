module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // TypeScript specific
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',

    // General rules
    'prefer-const': 'error',
    'no-var': 'error',
    'max-len': ['warn', { code: 120, ignoreUrls: true }],
    'no-console': 'off',
    'no-undef': 'off',
    'no-unused-vars': 'off',
  },
  env: {
    node: true,
    es2022: true,
  },
};
