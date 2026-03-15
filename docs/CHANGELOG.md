![Remyx Editor](./images/Remyx-Logo.svg)

# Changelog

All notable changes to the Remyx Editor monorepo are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [@remyx/react 0.23.41] — 2026-03-15

### Changed

- **RemyxEditor refactored into sub-hooks** — Extracted `useResolvedConfig`, `usePortalAttachment`, and `useEditorRect` hooks; component reduced from 406 to ~230 lines.
- **Modals lazy-loaded** — All 9 modal components now use `React.lazy` + `Suspense`, deferring ~20-30 KB until first open.
- **Toolbar wrapped in `React.memo`** — Prevents re-renders when props haven't changed.
- **useSelection split** — Format and UI state managed separately with `shallowEqual` bail-out; DOM queries cached via `useRef`.
- **Resize/scroll listeners** — Replaced `window.addEventListener` with `ResizeObserver` + `requestAnimationFrame` throttle.
- **Unused React imports removed** — Removed unnecessary `React` default import from 16 files using the new JSX transform.
- **Package metadata added** — `description`, `keywords`, `repository`, `bugs`, `homepage`, `author`, `license`, and `sideEffects` fields.

---

## [@remyx/core 0.23.16] — 2026-03-15

### Fixed

- **Uninitialized `isMarkdownMode`** — Added `this.isMarkdownMode = false` to `EditorEngine` constructor.
- **AutolinkPlugin event listener leak** — Added `destroy()` method with `removeEventListener` for stored handler.
- **`dangerouslySetInnerHTML` fallback** — Prevents XSS when sanitizer returns empty string.
- **FindReplace index wrap** — `currentIndex % length` replaced with `Math.min(currentIndex, length - 1)` after replace.
- **`splitCell` creates `<td>` in `<thead>`** — Now checks `row.closest('thead')` to create `<th>` or `<td>` appropriately.
- **`Selection.restore()` silent failure** — Wrapped in try/catch with fallback to end of editor content.
- **History undo/redo race condition** — Disconnects `MutationObserver` before modifying `innerHTML`.
- **FindReplace negative index** — Added `length === 0` guard at start of replace command.
- **Paste font regex attribute order** — Changed `<font\s+face=` to `<font\s[^>]*?face=` for position-independent matching.

### Changed

- **Document converter split** — Monolithic `documentConverter.js` replaced with per-format modules using dynamic imports.
- **Paste cleaners modularized** — Source detection (Word, Google Docs, LibreOffice, Apple Pages) gates format-specific cleanup.
- **Theme config split** — `themeConfig.js` split into `themeConfig.js`, `themePresets.js`, and `toolbarItemTheme.js` for tree-shaking.
- **PDF worker opt-in** — `mammoth` and `pdfjs-dist` moved to optional peer dependencies.
- **Terser minification** — Replaced default esbuild minifier with Terser; `drop_console` and `drop_debugger` enabled.
- **Sourcemaps hidden** — Production builds no longer emit `.map` files.
- **CSS universal selector** — Changed `box-sizing: border-box` to `box-sizing: inherit` for `.rmx-editor *`.
- **Magic numbers extracted** — `HEADING_BASE_FONT_SIZE`, `HEADING_FONT_SIZE_STEP`, `GENERATED_ID_LENGTH`, `DEFAULT_EDITOR_HEIGHT`.
- **Package metadata added** — `description`, `keywords`, `repository`, `bugs`, `homepage`, `author`, `license`, and `sideEffects` fields.
- **`.gitignore` updated** — Added `.code-workspace`, `coverage/`, `.vitest/`, `.claude/`.

### Security

- **Dangerous tags removed entirely** — `script`, `style`, `svg`, `math`, `form`, `object`, `embed`, `applet`, `template` are removed with children instead of unwrapped.
- **`on*` event handler blocking** — Explicit check rejects any attribute starting with `on` regardless of allowlist.
- **File size limits** — 10 MB default limit on pasted/dropped images and document imports.
- **History re-sanitization** — Undo/redo re-sanitizes HTML before assigning to `innerHTML`.
- **Input type restriction** — `<input>` elements limited to `type="checkbox"` only.
- **`contenteditable` removed** — Stripped from allowed `div` attributes in schema.
- **CSS injection blocked** — `expression()`, `@import`, `behavior:`, `javascript:` blocked in style values.
- **Plugin API facade** — Third-party plugins receive restricted API; `requiresFullAccess: true` needed for direct engine access.

---

## [0.23.4] — 2026-03-14

### Added

- **Multi-package architecture** — Extracted `@remyx/core` (framework-agnostic engine) and `@remyx/react` (React components + hooks) from the monolithic `remyx-editor` package.
- **`create-remyx` CLI** — Scaffolding tool for new projects with JSX and TypeScript templates.
- **npm workspaces** — Monorepo setup with `packages/*` workspace configuration.
- **TypeScript declarations** — `.d.ts` files for all React components, hooks, and core exports.
- **MIT License** — Added LICENSE file to repo root.

### Removed

- **`remyx-editor` package** — Standalone package deleted; consumers use `@remyx/react` directly.

---

## Prior Releases

Releases before 0.23.4 were shipped as the monolithic `remyx-editor` package. See the [Roadmap](./ROADMAP.md) for feature history.
