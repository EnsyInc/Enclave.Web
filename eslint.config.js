// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const perfectionist = require('eslint-plugin-perfectionist');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    plugins: {
      perfectionist,
    },
    rules: {
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'alphabetical',
          order: 'asc',
          internalPattern: ['^@enclave/'],
        },
      ],
      // Only sorts the array literal passed as a @Component's `imports` property -- every
      // other array in the codebase (SORTABLE_COLUMNS, displayedColumns, route configs, etc.)
      // is left untouched, since their order is semantically meaningful, not alphabetical.
      'perfectionist/sort-arrays': [
        'error',
        {
          type: 'alphabetical',
          order: 'asc',
          useConfigurationIf: {
            matchesAstSelector:
              "CallExpression[callee.name='Component'] > ObjectExpression > Property[key.name='imports'] > ArrayExpression",
          },
        },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'enclave',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: ['enclave', 'ensy-labs'],
          style: 'kebab-case',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['./*', '../*'],
              message:
                "Relative imports ('./', '../') are forbidden. Use a path alias instead (@enclave/*).",
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions'] }],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*'],
              message:
                "Parent-relative imports ('../') are forbidden. Use a path alias instead (@enclave/*).",
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/index.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);
