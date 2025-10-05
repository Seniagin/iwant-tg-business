module.exports = {
  root: true,
  env: { 
    browser: true, 
    es2020: true,
    node: true
  },
  extends: [
    'eslint:recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['react-refresh', '@typescript-eslint'],
  rules: {
    'react-refresh/only-export-components': 'off', // Allow mixed exports for contexts
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'off', // Allow any type for API responses
    'no-console': 'off', // Allow console statements for debugging
    'no-undef': 'off', // TypeScript handles this
  },
}
