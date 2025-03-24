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
    // Move all ignores from .eslintignore to here
    ignores: [
      // Build output
      '**/node_modules/**',
      '.next/**',
      'out/**',
      
      // Dependencies
      '**/node_modules/**',
      
      // Logs
      '**/*.log',
      
      // Environment variables
      '.env*',
      
      // Misc system files
      '**/.DS_Store',
      '**/.idea/**',
      '**/.vscode/**',
      '**/*.pem',
      
      // Config files that don't need lint checking
      'next.config.js',
      '.prettierrc.js',
      'postcss.config.js',
      'tailwind.config.js',
      'jest.config.js',
      'jest.setup.js',
      'sentry.*.config.js',
      
      // Scripts directory
      'scripts/**',
      
      // Markdown files
      '**/*.md',
      
      // Public assets
      '**/public/**',
      
      // TypeScript declaration files
      'next-env.d.ts',
      
      // Prisma
      'prisma/**',
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
      // Basic rules
      'no-unused-vars': 'off', // Turned off in favor of TypeScript version
      
      // TypeScript rules - increase severity for critical issues
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true 
      }],
      '@typescript-eslint/no-explicit-any': 'error', // Upgrade from warning to error
      '@typescript-eslint/no-require-imports': 'off', // Disable for JS config files
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-interface': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      
      // React rules
      'react/display-name': 'off',
      'react/no-unescaped-entities': 'off',
      'react/prop-types': 'off',
      
      // React Hooks rules - properly enforce hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // Next.js rules
      '@next/next/no-img-element': 'warn',
      
      // Best practices
      'prefer-const': 'error',
      'import/no-anonymous-default-export': 'warn',
    },
  },
];
