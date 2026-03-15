![Remyx Editor](./images/Remyx-Logo.svg)

# Cleanup & Technical Debt

**Last updated:** 2026-03-15
**Version:** 0.23.16

A prioritized list of cleanup tasks, code quality improvements, and technical debt across the Remyx Editor monorepo.

---

## ~~Critical — Duplicate Code~~ ✅ Resolved

The `remyx-editor` standalone package has been removed entirely. All source code now lives exclusively in `@remyx/core` and `@remyx/react`.

- [x] **Remove duplicate core files from `remyx-editor/src/`** — Resolved by deleting the entire `remyx-editor` package.
- [x] **Remove duplicate React files from `remyx-editor/src/`** — Resolved by deleting the entire `remyx-editor` package.
- [x] **Duplicate CSS themes** — Resolved by deleting the entire `remyx-editor` package.
- [x] **Duplicate dependencies** — Resolved by deleting the entire `remyx-editor` package.

---

## High — Missing Tests

No test files exist anywhere in the monorepo. This is the biggest quality gap.

- [ ] **Set up test infrastructure** — Add Vitest as the test runner (already using Vite for builds)
- [ ] **Core engine tests** — `EditorEngine` init/destroy, `getHTML`/`setHTML`, `executeCommand`, `isEmpty`, `focus`/`blur`
- [ ] **Command tests** — Each of the 16 command register functions needs at least basic assertions
- [ ] **Sanitizer tests** — XSS prevention, tag allowlisting, attribute filtering, style cleaning
- [ ] **History tests** — Undo/redo, snapshot management, stack limits
- [ ] **Plugin system tests** — `createPlugin`, `PluginManager.register`, lifecycle hooks
- [ ] **Utility tests** — `htmlToMarkdown`, `markdownToHtml`, `cleanPastedHTML`, `looksLikeMarkdown`, `convertDocument`, `exportAsPDF`
- [ ] **React hook tests** — `useEditorEngine`, `useRemyxEditor`, `useSelection`, `useModal`
- [ ] **Component tests** — `RemyxEditor` rendering with various prop combinations
- [ ] **E2E tests** — Playwright for toolbar interactions, paste handling, drag-and-drop, modals

---

## ~~High — Package Metadata~~ ✅ Resolved

- [x] **Add `description`** — Added to both `remyx-core` and `remyx-react` `package.json`.
- [x] **Add `keywords`** — Added WYSIWYG/editor/rich-text keywords to both packages.
- [x] **Add `repository`** — Added with `directory` field pointing to each package.
- [x] **Add `bugs`** and `homepage` — Added GitHub Issues URL and package-specific README links.
- [x] **Add `author`** and `license` — Added `"Remyx"` author and `"MIT"` license to both packages.
- [x] **Add `sideEffects`** — `["*.css"]` for core, `false` for react.

---

## High — Build Configuration

- [ ] **No `tsconfig.json`** — Even though the source is JS, a root `tsconfig.json` with `allowJs: true` would enable IDE type checking and make the `.d.ts` files in `remyx-react/src/types/` actually consumable
- [ ] **No bundle analysis** — Add `rollup-plugin-visualizer` or `vite-bundle-analyzer` to track bundle size regressions

---

## High — Error Handling

- [ ] **Unhandled promise rejections** — `convertDocument()`, `exportAsPDF()`, `exportAsDocx()` return promises but callers in modals don't always have comprehensive error recovery
- [ ] **EditorEngine constructor** — No try/catch around `contentEditable` setup; a misconfigured element could throw silently
- [ ] **Selection.js `commitSelection`** — Stores DOM range without error handling; can throw if the DOM state is unexpected
- [ ] **File upload errors** — `uploadHandler` rejections should surface user-visible errors, not just console warnings
- [ ] **Plugin initialization** — `PluginManager` catches errors but only logs them; add an `onError` callback

---

## High — Component Size

These components are oversized and should be refactored:

- [x] **`RemyxEditor.jsx` (406 lines)** — ✅ Extracted into `useResolvedConfig`, `usePortalAttachment`, and `useEditorRect` hooks. Modals lazy-loaded with `React.lazy`. Now ~230 lines.
- [ ] **`Toolbar.jsx` (232 lines)** — Extract the command execution logic into a shared hook or utility used by both Toolbar and MenuBar
- [ ] **`useEditorEngine.js` (~200 lines)** — The command registration block is repetitive; consider a loop over a registry array

---

## Medium — Accessibility

- [x] **Toolbar buttons missing `aria-pressed`** — ✅ `ToolbarButton` already has `aria-pressed={active}`.
- [x] **Toolbar buttons missing `aria-label`** — ✅ `ToolbarButton` already has `aria-label={tooltip}`.
- [x] **Modal overlays missing `role="dialog"`** — ✅ `ModalOverlay` already has `role="dialog"` and `aria-modal="true"`.
- [x] **Color picker swatches** — ✅ Already has `aria-label={`Color ${color}`}`.
- [ ] **Menu bar** — Should implement WAI-ARIA menu pattern: `role="menubar"`, `role="menu"`, `role="menuitem"`, `aria-haspopup`, `aria-expanded`
- [ ] **Focus management in modals** — Verify focus is trapped inside open modals and restored on close
- [ ] **Skip navigation** — No skip link for keyboard users to jump past the toolbar to content
- [ ] **Heading hierarchy** — The editor should respect the host page's heading level (configurable base level)

---

## Medium — React Performance

- [x] **Missing `React.memo`** — ✅ `ToolbarButton`, `ToolbarSeparator`, `ToolbarColorPicker`, `ToolbarDropdown`, and `Toolbar` are all wrapped in `React.memo`.
- [x] **`useSelection` polling** — ✅ Split into `formatState`/`uiState` with `shallowEqual` bail-out. DOM queries cached via `useRef`.
- [ ] **`useEffect` dependency warnings suppressed** — 6 instances of `// eslint-disable-line react-hooks/exhaustive-deps` across `RemyxEditor.jsx`, `useEditorEngine.js`, and `useRemyxEditor.js`. These need investigation to determine if they cause stale closure bugs or are legitimate optimizations.

---

## Medium — TypeScript

- [ ] **Core modules have no type annotations** — All `.js` files in `remyx-core/src/` lack JSDoc `@param`/`@returns` comments. Adding these would improve IDE autocomplete for JS consumers and could generate `.d.ts` files automatically.
- [ ] **`remyx-react/src/types/index.d.ts` is isolated** — The type declarations aren't verified against the actual source. Types could drift. Consider generating from JSDoc or adding a CI type-check step.
- [ ] **No `tsconfig.json` in any package** — Even a minimal config with `checkJs: true` would catch type errors in IDE

---

## Medium — CSS

- [ ] **Extensive inline styles** — Many components use `style={{...}}` props instead of CSS classes. Examples:
  - `ImportDocumentModal.jsx` — preview container styles (lines 94-103)
  - `ToolbarColorPicker.jsx` — swatch grid and color buttons
  - `StatusBar.jsx` — layout styles
  - `FloatingToolbar.jsx` — positioning styles (justified: dynamic positioning)
- [ ] **No CSS minification verification** — Check that Vite's CSS output is properly minified for production
- [ ] **`variables.css` is 1317 lines** — Consider splitting into logical sections or using CSS layers

---

## Low — Git Hygiene

- [x] **`.DS_Store` tracked in git** — ✅ Already in `.gitignore` and not tracked.
- [x] **Stale file deletions** — ✅ No stale deletions remain; files were moved and committed.
- [x] **`.claude/` directory** — ✅ Added to `.gitignore`.
- [x] **Add `.gitignore` entries** — ✅ Added `.code-workspace`, `coverage/`, `.vitest/`.

---

## Low — Code Style

- [x] **Magic numbers** — ✅ Extracted `HEADING_BASE_FONT_SIZE`/`HEADING_FONT_SIZE_STEP` in Toolbar.jsx, `GENERATED_ID_LENGTH` in dom.js, `DEFAULT_EDITOR_HEIGHT` in useResolvedConfig.js.
- [x] **Inconsistent React import** — ✅ Removed unnecessary `React` default imports from 16 files that only use named imports.
- [x] **`"default" is imported from external module "react" but never used`** — ✅ Fixed — only files using `React.memo`/`React.lazy` retain the default import.

---

## Low — Documentation

- [ ] **No CONTRIBUTING.md** — Add contributor guidelines, development setup, and PR process
- [x] **No CHANGELOG.md** — ✅ Added `CHANGELOG.md` to `packages/docs/`.
- [x] **No LICENSE file** — ✅ MIT LICENSE file added to repo root.
- [ ] **API docs** — Consider generating API documentation from JSDoc comments (TypeDoc or similar)
- [ ] **Storybook / examples** — The demo app in `src/App.jsx` is good but could be a standalone Storybook for visual testing

---

## Low — Dependencies

- [ ] **Pin dependency versions** — All deps use `^` ranges. For a library, this is fine for consumers, but consider using exact versions in `devDependencies` for reproducible builds.
- [ ] **Audit for vulnerabilities** — Run `npm audit` regularly
- [ ] **Unused dev dependencies** — Check if `eslint-plugin-react-refresh` is needed in the root package (only relevant for the dev app)
- [ ] **Consider bundling `marked` and `turndown`** — These are bundled into the output anyway; making them regular dependencies adds to the consumer's `node_modules` size without benefit. Alternatively, make them optional/lazy-loaded.

---

## Informational — Future Improvements

These aren't bugs or debt — they're enhancements worth considering:

- [ ] **Error boundaries** — Wrap `<RemyxEditor>` in a React error boundary so a crash doesn't take down the host app
- [ ] **`onError` callback prop** — Let consumers handle editor errors gracefully
- [x] **Lazy-load heavy modules** — ✅ `pdfjs-dist` and `mammoth` moved to optional peer deps; `convertDocument()` uses dynamic imports per format.
- [ ] **Web Worker for sanitization** — Move HTML sanitization off the main thread for large documents
- [ ] **Source maps** — Ensure `.map` files are generated for all production builds
- [ ] **CDN build** — Add a UMD/IIFE build for `<script>` tag consumers
- [ ] **Pre-commit hooks** — Add Husky + lint-staged for automatic linting on commit
- [ ] **CI pipeline** — GitHub Actions workflow for build + lint + test on every PR

---

## Priority Order

| Priority | Category | Items | Blocked On |
| --- | --- | --- | --- |
| ~~**1**~~ | ~~Duplicate code removal~~ | ~~4 items~~ | ✅ Complete |
| **2** | Test infrastructure | 10 items | — |
| ~~**3**~~ | ~~Package metadata~~ | ~~6 items~~ | ✅ Complete |
| **4** | Build config fixes | 2 items | — |
| **5** | Error handling | 5 items | — |
| **6** | Component refactoring | 1 of 3 done | — |
| **7** | Accessibility | 4 of 8 done | — |
| ~~**8**~~ | ~~React performance~~ | ~~2 of 3 done~~ | ✅ Mostly complete |
| **9** | TypeScript | 3 items | — |
| **10** | CSS cleanup | 3 items | — |
| ~~**11**~~ | ~~Git hygiene~~ | ~~4 items~~ | ✅ Complete |
| ~~**12**~~ | ~~Code style~~ | ~~3 items~~ | ✅ Complete |
| **13** | Documentation | 2 of 5 remaining | — |
| **14** | Dependencies | 4 items | — |
| **15** | Future improvements | 7 items | — |
