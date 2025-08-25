module.exports = {
  extends: ['@typescript-eslint/recommended', 'airbnb-base', 'airbnb-typescript/base', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'import', 'prefer-arrow', 'jsdoc', 'react', 'react-hooks'],
  rules: {
    // TypeScript specific
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',

    // Import rules
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc' },
      },
    ],
    'import/no-unresolved': 'error',
    'import/no-cycle': 'error',
    'import/prefer-default-export': 'off',

    // React specific
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // General rules
    'prefer-const': 'error',
    'no-var': 'error',
    'prefer-arrow/prefer-arrow-functions': 'error',
    'max-len': ['error', { code: 100, ignoreUrls: true }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    // JSDoc rules
    'jsdoc/check-alignment': 'error',
    'jsdoc/check-param-names': 'error',
    'jsdoc/check-return-types': 'error',
    'jsdoc/require-param': 'error',
    'jsdoc/require-returns': 'error',
  },
  env: {
    browser: true,
    es2022: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
