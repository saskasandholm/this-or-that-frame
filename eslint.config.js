const js = require('@eslint/js');
const { FlatCompat } = require('@eslint/eslintrc');
const eslintPluginPrettierRecommended = require('eslint-config-prettier');
const globals = require('globals');
const path = require('path');

// @ts-check
const compat = new FlatCompat({
  baseDirectory: path.join(__dirname, 'eslint.config.js'),
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  {
    ignores: [
      '**/node_modules/**',
      '.next/**',
      'next.config.js',
      '.prettierrc.js',
      '**/*.md',
      '**/public/**',
      '**/.vscode/**',
      '**/.git/**',
      'next-env.d.ts',
      'postcss.config.js',
      'tailwind.config.js',
      '.eslintrc.js',
    ],
  },
  js.configs.recommended,
  ...compat.extends(
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended'
  ),
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn'],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-interface': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',
      'react/display-name': 'off',
      'react/no-unescaped-entities': 'off',
      'react/prop-types': 'off',
    },
  },
];
