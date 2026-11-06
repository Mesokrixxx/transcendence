# ChessMove - i18n

---

## Table of Contents

- [Architecture and conventions](#architecture-and-conventions)
- [Using i18n in new components](#using-i18n-in-new-components)
  - [Example](#example)
- [Advanced uses](#advanced-uses)
  - [Variables in translations](#variables-in-translations)
  - [Components inside translations](#components-inside-translations)
    - [Using indexed components](#using-indexed-components)
    - [Using named components](#using-named-components)
- [Scripts](#scripts)
  - [Extract](#extract)
  - [Sync](#sync)
  - [Types](#types)
  - [Status](#status)
  - [Lint](#lint)
  - [Check](#check)
- [Checklist](#checklist)

---

## Architecture and conventions

ChessMove supports three languages: English, French, and Spanish.

Translations are stored in `public/locales/{language}/{namespace}.json`.

Each namespace should contain keys related to its functional domain. Translation keys should use `camelCase`.

English is the reference language. All translations should be based on the English version. Translation keys must be written in English, and their values must correspond to the language of the directory in which they are stored.

The `i18next` runtime configuration is located in `src/services/i18n.ts`.

The `i18next.config.ts` file contains the configuration for `i18next-cli`, which provides the [i18n scripts](#scripts).

The TypeScript definitions in `src/types/resources.d.ts` are generated from the English translation files. **This file must never be edited manually.**

## Using i18n in new components

User-facing text must be translated using `i18next`. Avoid hardcoded strings in rendered components.

When adding new text to a component, follow these steps:

1. Add a key-value pair to the appropriate namespace in `public/locales/en/{namespace}.json`.
2. Add the same key to the corresponding French and Spanish files, with the appropriate translations.
3. Use the translation in your component with the `useTranslation` hook.
4. Regenerate the TypeScript definitions when the reference catalogues change.

### Example

Suppose you want to display the word "Stalemate" in a chess component.

**1. Add the English translation** to `public/locales/en/chess.json`:

```json
{
  "stalemate": "Stalemate"
}
```

**2. Add the translations** to `public/locales/fr/chess.json` and `public/locales/es/chess.json`:

```json
{
  "stalemate": "Pat"
}
```

```json
{
  "stalemate": "Ahogado"
}
```

**3. Use the translation** in your component:

```tsx
import { useTranslation } from 'react-i18next';

function ChessComponent() {
  const { t } = useTranslation('chess');

  return <h1>{t('stalemate')}</h1>;
}
```

The namespace is specified in `useTranslation('chess')`, so the key can be used directly.

You can also use the default namespace and explicitly specify another namespace for individual keys:

```tsx
import { useTranslation } from 'react-i18next';

function ChessComponent() {
  const { t } = useTranslation();

  return <h1>{t('stalemate', { ns: 'chess' })}</h1>;
}
```

When no namespace is specified, the default namespace is `common`.

**4. Update the generated types** when the English catalogue changes. See the [Types](#types) section.

## Advanced uses

### Variables in translations

Sometimes, a translation needs to include a dynamic value.

You can use interpolation:

```json
{
  "currentElo": "Your current ELO is {{elo}}."
}
```

```tsx
const { t } = useTranslation('profile');

return <div>{t('currentElo', { elo: 1000 })}</div>;
```

The resulting text is:

> Your current ELO is 1000.

Make sure that interpolation variables are consistent across all languages.

### Components inside translations

Sometimes, a translation needs to contain React components, such as links or formatted text. Use the `Trans` component from `react-i18next`.

There are two common approaches.

#### Using indexed components

```json
{
  "projectCredit": "<0>This project was created as part of the 42 curriculum by</0>"
}
```

```tsx
import { Trans } from 'react-i18next';

return (
  <Trans ns="common" i18nKey="projectCredit">
    <i>This project was created as part of the 42 curriculum by</i>
  </Trans>
);
```

This approach uses the component structure provided as children. The translation must preserve the intended component placement.

_Yes, the obligatory 42 README line is italicized, as every first line should be._

#### Using named components

You can instead give components explicit names:

```json
{
  "projectCredit": "<italic>This project was created as part of the 42 curriculum by</italic>"
}
```

```tsx
import { Trans } from 'react-i18next';

return (
  <Trans
    ns="common"
    i18nKey="projectCredit"
    components={{
      italic: <i />,
    }}
  />
);
```

This approach makes the relationship between translation tags and React components easier to understand.

**Prefer translating complete sentences rather than concatenating translated fragments.** Word order, punctuation, and grammar can differ between languages.

## Scripts

Several npm scripts are available to make internationalization easier and less error-prone.

Use them regularly during development and before important commits or pull requests. They help detect missing translations, stale generated types, and other common i18n issues.

### Extract

You can add translation keys directly to the English catalogue, or use `i18next-cli extract` to extract keys from your source code.

For example, with the `chess` namespace:

```tsx
const { t } = useTranslation('chess');

return <h1>{t('stalemate', 'Stalemate')}</h1>;
```

Then run:

```bash
npm run i18n:extract
```

The CLI can use the default value to populate the English catalogue.

The namespace is determined from the translation call and its context. If no namespace can be determined, the configured default namespace is used.

**Important:** extraction is based on static analysis. Keys referenced indirectly through variables or constructed dynamically may not always be detected.

The project is configured to preserve keys that are not detected during extraction. Nevertheless, always review the changes made by the command.

Extraction does not translate new keys into French or Spanish.

### Sync

Run:

```bash
npm run i18n:sync
```

This synchronizes the non-reference language catalogues with the English reference catalogue.

It can add missing keys, but it can also remove keys that no longer exist in the reference catalogue. Newly created entries may have empty values and must be translated.

**Always inspect `git diff` after synchronization.** Do not assume that every apparently unused key is genuinely obsolete: some keys may be referenced indirectly.

### Types

Run:

```bash
npm run i18n:types
```

This regenerates the TypeScript definitions from the translation catalogues, including `src/types/resources.d.ts`.

Run it after modifying the English reference catalogue. The generated files must not be edited manually.

The strict typing helps detect invalid translation keys and provides editor autocompletion.

### Status

Run:

```bash
npm run i18n:status
```

This reports the status of the translation catalogues and helps identify missing translations.

The goal is to have every required key translated in every supported language.

### Lint

Run:

```bash
npm run i18n:lint
```

This checks translation-related issues according to the configured lint rules, including certain hardcoded user-facing strings.

Static analysis cannot detect every problem. For example, an English value stored in a variable and displayed to the user may escape detection. Such values must also be translated when appropriate.

### Check

Run:

```bash
npm run i18n:check
```

This combines several checks:

- Verifies that extraction would not change the catalogues.
- Verifies that generated types are up to date.
- Checks translation status.
- Runs the i18n linter.

The command should exit successfully without reporting errors.

This is a validation command, not a replacement for manually reviewing translations. It does not guarantee that every translation is natural, contextually correct, or free of false positives caused by dynamic keys.

The general project check also includes the i18n checks:

```bash
npm run check
```

This runs the general lint, formatting check, i18n checks, and build.

## Checklist

When adding a new component or page with user-facing text:

1. Add the key to `public/locales/en/{namespace}.json`, or use the extraction script.
2. Run `npm run i18n:extract` if you added keys in the source code.
3. Run `npm run i18n:sync` if needed, and carefully inspect the resulting changes.
4. Add or review the French and Spanish translations.
5. Run `npm run i18n:types` if the reference catalogue changed.
6. Review `git diff` to ensure that no required keys or translations were accidentally removed.
7. Run `npm run i18n:check` or `npm run check`.

All translations should be complete, and the relevant checks should pass before committing.

When in doubt about a key reported as unused, check its references in the source code before removing it.
