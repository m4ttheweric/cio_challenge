// eslint.config.mjs
import mantine from 'eslint-config-mantine';
import prettier from 'eslint-config-prettier/flat';
// Only the extra plugins Mantine doesn't add
import noUnsanitized from 'eslint-plugin-no-unsanitized';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/dist/**', 'dist/**'] },

  // Mantine flat config first (it already sets up react, jsx-a11y, etc.)
  ...mantine,

  // Your base tweaks (no plugin re-declarations here)
  {
    ignores: ['**/*.{mjs,cjs,js,d.ts,d.mts}', './.storybook/main.ts'],
    languageOptions: {
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2020,
      },
    },
  },

  // Add ONLY extra plugins + rules that need them, in the SAME object
  {
    plugins: {
      'no-unsanitized': noUnsanitized,
      'react-refresh': reactRefresh,
    },
    rules: {
      // needs no-unsanitized plugin
      'no-unsanitized/method': 'error',
      'no-unsanitized/property': 'error',

      // needs react-refresh plugin
      'react-refresh/only-export-components': 'warn',

      // your other overrides (these can reference plugins Mantine already provides)
      'react/no-danger': 'error',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { args: 'none', varsIgnorePattern: 'React', ignoreRestSiblings: true },
      ],
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/label-has-associated-control': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },

  // Stories override
  {
    files: ['**/*.story.tsx', '**/*.stories.{ts,tsx}'],
    rules: { 'no-console': 'off' },
  },

  // Prettier last
  prettier
);
