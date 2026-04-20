import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import reactPlugin from 'eslint-plugin-react'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),

  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      react: reactPlugin,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Track variables used as JSX member expressions (e.g. motion.div, Comp.Sub)
      'react/jsx-uses-vars': 'error',

      // Unused vars — ignore uppercase/underscore patterns (component names, intentional)
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],

      // Exhaustive deps — warn only, many intentional patterns use stable callbacks
      'react-hooks/exhaustive-deps': 'warn',

      // Disabled: this rule flags async data fetching and derived-state sync patterns that
      // are explicitly recommended in the React docs. It produces too many false positives.
      'react-hooks/set-state-in-effect': 'off',
    },
  },

  // Shadcn ui components export both variants and components — fast-refresh warning is expected
  {
    files: ['src/components/ui/**/*.{js,jsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },

  // Context files export both Provider + hook — suppress fast-refresh false positive
  {
    files: ['src/context/**/*.{js,jsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
