import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';


export default defineConfig({
  files: ['**/*.{js,ts}'],
  ignores: ['dist/**'],
  extends: [js.configs.recommended, tseslint.configs.recommended, eslintConfigPrettier],
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_"
      }
    ]
  },
});
