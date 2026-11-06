import { defineConfig } from 'i18next-cli'

export default defineConfig({
  locales: ['en', 'fr', 'es'],
  extract: {
    input: ['src/**/*.{ts,tsx}'],
    output: 'public/locales/{{language}}/{{namespace}}.json',
    defaultNS: 'common',
    removeUnusedKeys: false,
  },
  types: {
    input: 'public/locales/en/*.json',
    output: 'src/types/i18next.d.ts',
  },
})
