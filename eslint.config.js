import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';
import globals from 'globals';

// Set up file paths for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create compatibility layer between new flat config and traditional config
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  // JavaScript base configuration
  js.configs.recommended,

  // Use Next.js configurations through compatibility layer
  ...compat.extends('next/core-web-vitals'),

  // Use typescript-eslint recommended configuration
  ...tseslint.configs.recommended,

  // Prettier integration - should come last to override other configs
  ...compat.extends('prettier'),

  // Common rules for all files
  {
    rules: {
      // Disable problematic rules
      'react/no-unescaped-entities': 'off',
      'prefer-const': 'off',
      'import/no-anonymous-default-export': 'off',
      '@next/next/no-img-element': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },

  // Additional TypeScript rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // Customize TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
    },
  },

  // Jest configuration
  {
    files: ['**/*.test.js', '**/*.test.ts', '**/*.test.tsx', 'jest.setup.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
  },

  // Add ignores for build directories and config files
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'public/**',
      'coverage/**',
      'test-results/**',
      'playwright-report/**',
      '**/*.config.js',
      'scripts/**',
    ],
  },
];
