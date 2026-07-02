import js from '@eslint/js'
import ts from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'

export default ts.config(
  { ignores: ['dist', 'node_modules', 'coverage'] },

  js.configs.recommended,
  ...ts.configs.recommended,
  ...pluginVue.configs['flat/recommended'],

  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: { parser: ts.parser },
    },
  },

  // Turn off stylistic rules that conflict with Prettier.
  prettier,

  {
    rules: {
      // This codebase intentionally uses `any` for loosely-typed row/field data.
      '@typescript-eslint/no-explicit-any': 'off',
      // Single-word component files (App.vue) are fine.
      'vue/multi-word-component-names': 'off',
      // TypeScript already resolves globals/types (document, HTMLDivElement…).
      'no-undef': 'off',
    },
  },
)
