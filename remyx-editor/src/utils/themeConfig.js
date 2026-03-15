/**
 * All available theme variables with descriptions.
 * Keys are the camelCase names used with createTheme().
 * Values are objects with the CSS variable name and a description.
 */
export const THEME_VARIABLES = {
  // Color Palette
  bg:              { var: '--rmx-bg',              description: 'Editor background color' },
  text:            { var: '--rmx-text',            description: 'Primary text color' },
  textSecondary:   { var: '--rmx-text-secondary',  description: 'Secondary/muted text color' },
  border:          { var: '--rmx-border',          description: 'Border color' },
  borderSubtle:    { var: '--rmx-border-subtle',   description: 'Subtle/light border color' },

  // Toolbar
  toolbarBg:           { var: '--rmx-toolbar-bg',            description: 'Toolbar background color' },
  toolbarBorder:       { var: '--rmx-toolbar-border',        description: 'Toolbar border color' },
  toolbarButtonHover:  { var: '--rmx-toolbar-button-hover',  description: 'Toolbar button hover background' },
  toolbarButtonActive: { var: '--rmx-toolbar-button-active', description: 'Toolbar button active background' },
  toolbarIcon:         { var: '--rmx-toolbar-icon',          description: 'Toolbar icon color' },
  toolbarIconActive:   { var: '--rmx-toolbar-icon-active',   description: 'Toolbar icon active color' },

  // Accent / Primary
  primary:      { var: '--rmx-primary',       description: 'Primary accent color' },
  primaryHover: { var: '--rmx-primary-hover', description: 'Primary color on hover' },
  primaryLight: { var: '--rmx-primary-light', description: 'Light variant of primary (backgrounds)' },
  focusRing:    { var: '--rmx-focus-ring',    description: 'Focus ring outline color' },
  selection:    { var: '--rmx-selection',      description: 'Text selection highlight color' },

  // Feedback
  danger:      { var: '--rmx-danger',       description: 'Error/danger color' },
  dangerLight: { var: '--rmx-danger-light', description: 'Light variant of danger' },

  // UI Elements
  placeholder:   { var: '--rmx-placeholder',    description: 'Placeholder text color' },
  modalBg:       { var: '--rmx-modal-bg',       description: 'Modal background color' },
  modalOverlay:  { var: '--rmx-modal-overlay',  description: 'Modal overlay background' },
  statusbarBg:   { var: '--rmx-statusbar-bg',   description: 'Status bar background' },
  statusbarText: { var: '--rmx-statusbar-text', description: 'Status bar text color' },
  hoverBg:       { var: '--rmx-hover-bg',       description: 'Generic hover background' },

  // Shadows
  shadowSm:    { var: '--rmx-shadow-sm',    description: 'Small shadow' },
  shadowMd:    { var: '--rmx-shadow-md',    description: 'Medium shadow' },
  shadowLg:    { var: '--rmx-shadow-lg',    description: 'Large shadow' },
  shadowFloat: { var: '--rmx-shadow-float', description: 'Floating element shadow' },

  // Typography
  fontFamily:        { var: '--rmx-font-family',         description: 'UI font stack' },
  fontSize:          { var: '--rmx-font-size',           description: 'UI font size' },
  contentFontSize:   { var: '--rmx-content-font-size',   description: 'Content area font size' },
  contentLineHeight: { var: '--rmx-content-line-height', description: 'Content area line height' },

  // Spacing & Shape
  radius:      { var: '--rmx-radius',      description: 'Standard border radius' },
  radiusSm:    { var: '--rmx-radius-sm',   description: 'Small border radius' },
  radiusInner: { var: '--rmx-radius-inner', description: 'Inner element border radius' },
  spacingXs:   { var: '--rmx-spacing-xs',  description: 'Extra small spacing (4px)' },
  spacingSm:   { var: '--rmx-spacing-sm',  description: 'Small spacing (8px)' },
  spacingMd:   { var: '--rmx-spacing-md',  description: 'Medium spacing (12px)' },

  // Transitions
  transitionFast:   { var: '--rmx-transition-fast',   description: 'Fast transition duration' },
  transitionNormal: { var: '--rmx-transition-normal', description: 'Normal transition duration' },
}

// Build a quick lookup: camelCase key → CSS variable name
const KEY_TO_VAR = {}
for (const [key, meta] of Object.entries(THEME_VARIABLES)) {
  KEY_TO_VAR[key] = meta.var
}

/**
 * Create a theme object from friendly camelCase overrides.
 * The returned object can be passed directly to the `customTheme` prop.
 *
 * Accepts either camelCase keys (e.g. `bg`, `primary`, `toolbarBg`) or
 * raw CSS variable names (e.g. `--rmx-bg`). Both formats can be mixed.
 *
 * @param {Object} overrides - Theme variable overrides
 * @returns {Object} CSS custom property object for use as `customTheme`
 *
 * @example
 * const myTheme = createTheme({
 *   bg: '#1a1a2e',
 *   primary: '#e94560',
 *   toolbarBg: '#16213e',
 *   radius: '12px',
 * })
 *
 * <RemyxEditor customTheme={myTheme} />
 */
export function createTheme(overrides) {
  const result = {}
  for (const [key, value] of Object.entries(overrides)) {
    if (key.startsWith('--rmx-')) {
      // Raw CSS variable — pass through
      result[key] = value
    } else if (KEY_TO_VAR[key]) {
      // camelCase key → CSS variable
      result[KEY_TO_VAR[key]] = value
    } else {
      // Unknown key — try as a CSS variable anyway
      result[`--rmx-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`] = value
    }
  }
  return result
}

/**
 * Built-in theme presets.
 * Each preset is a CSS custom property object ready to pass to `customTheme`.
 * They layer on top of the base `theme` (light or dark).
 */
export const THEME_PRESETS = {
  /** Deep blue ocean palette */
  ocean: createTheme({
    bg: '#0f172a',
    text: '#e2e8f0',
    textSecondary: '#94a3b8',
    border: '#1e3a5f',
    borderSubtle: '#1e3a5f',
    toolbarBg: '#0c1426',
    toolbarBorder: '#1e3a5f',
    toolbarButtonHover: '#1e3a5f',
    toolbarButtonActive: '#1e4976',
    toolbarIcon: '#94a3b8',
    toolbarIconActive: '#38bdf8',
    primary: '#0ea5e9',
    primaryHover: '#0284c7',
    primaryLight: 'rgba(14, 165, 233, 0.15)',
    focusRing: '#0ea5e9',
    selection: '#0c4a6e',
    placeholder: '#475569',
    modalBg: '#0c1426',
    modalOverlay: 'rgba(0, 0, 0, 0.6)',
    statusbarBg: '#0c1426',
    statusbarText: '#64748b',
  }),

  /** Green earth-tone forest palette */
  forest: createTheme({
    bg: '#14201a',
    text: '#d1e7dd',
    textSecondary: '#8fbc8f',
    border: '#2d4a3e',
    borderSubtle: '#2d4a3e',
    toolbarBg: '#0f1a14',
    toolbarBorder: '#2d4a3e',
    toolbarButtonHover: '#2d4a3e',
    toolbarButtonActive: '#1a5c3a',
    toolbarIcon: '#8fbc8f',
    toolbarIconActive: '#4ade80',
    primary: '#22c55e',
    primaryHover: '#16a34a',
    primaryLight: 'rgba(34, 197, 94, 0.15)',
    focusRing: '#22c55e',
    selection: '#14532d',
    placeholder: '#4a7c5f',
    modalBg: '#0f1a14',
    modalOverlay: 'rgba(0, 0, 0, 0.6)',
    statusbarBg: '#0f1a14',
    statusbarText: '#4a7c5f',
  }),

  /** Warm orange/amber sunset palette */
  sunset: createTheme({
    bg: '#1c1210',
    text: '#fde8d0',
    textSecondary: '#d4a574',
    border: '#5c3a28',
    borderSubtle: '#5c3a28',
    toolbarBg: '#181010',
    toolbarBorder: '#5c3a28',
    toolbarButtonHover: '#5c3a28',
    toolbarButtonActive: '#7c4a2a',
    toolbarIcon: '#d4a574',
    toolbarIconActive: '#fb923c',
    primary: '#f97316',
    primaryHover: '#ea580c',
    primaryLight: 'rgba(249, 115, 22, 0.15)',
    focusRing: '#f97316',
    selection: '#7c2d12',
    placeholder: '#8b6f47',
    modalBg: '#181010',
    modalOverlay: 'rgba(0, 0, 0, 0.6)',
    statusbarBg: '#181010',
    statusbarText: '#8b6f47',
  }),

  /** Soft pink/rose palette */
  rose: createTheme({
    bg: '#1c1018',
    text: '#fde2ee',
    textSecondary: '#d4809f',
    border: '#5c2848',
    borderSubtle: '#5c2848',
    toolbarBg: '#18101a',
    toolbarBorder: '#5c2848',
    toolbarButtonHover: '#5c2848',
    toolbarButtonActive: '#7c2858',
    toolbarIcon: '#d4809f',
    toolbarIconActive: '#fb7185',
    primary: '#f43f5e',
    primaryHover: '#e11d48',
    primaryLight: 'rgba(244, 63, 94, 0.15)',
    focusRing: '#f43f5e',
    selection: '#881337',
    placeholder: '#8b4766',
    modalBg: '#18101a',
    modalOverlay: 'rgba(0, 0, 0, 0.6)',
    statusbarBg: '#18101a',
    statusbarText: '#8b4766',
  }),
}

// ---------------------------------------------------------------------------
// Per-item toolbar theming
// ---------------------------------------------------------------------------

/**
 * Maps friendly camelCase keys to CSS custom property names for per-item
 * toolbar button styling.  These variables are scoped to individual toolbar
 * elements via inline styles, so they only affect the element they're set on.
 */
export const TOOLBAR_ITEM_STYLE_KEYS = {
  color:            { var: '--rmx-tb-color',       description: 'Icon / text color' },
  background:       { var: '--rmx-tb-bg',          description: 'Default background' },
  hoverColor:       { var: '--rmx-tb-hover-color', description: 'Color on hover' },
  hoverBackground:  { var: '--rmx-tb-hover-bg',    description: 'Background on hover' },
  activeColor:      { var: '--rmx-tb-active-color', description: 'Color when active / pressed' },
  activeBackground: { var: '--rmx-tb-active-bg',   description: 'Background when active' },
  border:           { var: '--rmx-tb-border',      description: 'Border shorthand' },
  borderRadius:     { var: '--rmx-tb-radius',      description: 'Border radius' },
  size:             { var: '--rmx-tb-size',         description: 'Button width & height' },
  iconSize:         { var: '--rmx-tb-icon-size',   description: 'Icon size inside button' },
  padding:          { var: '--rmx-tb-padding',     description: 'Button padding' },
  opacity:          { var: '--rmx-tb-opacity',     description: 'Button opacity' },
}

const ITEM_KEY_TO_VAR = {}
for (const [key, meta] of Object.entries(TOOLBAR_ITEM_STYLE_KEYS)) {
  ITEM_KEY_TO_VAR[key] = meta.var
}

const SEPARATOR_KEY_TO_VAR = {
  color:  '--rmx-tb-sep-color',
  width:  '--rmx-tb-sep-width',
  height: '--rmx-tb-sep-height',
  margin: '--rmx-tb-sep-margin',
}

/**
 * Convert a per-item overrides object (friendly keys or raw CSS vars) into
 * an inline style object of CSS custom properties.
 *
 * @param {Object} overrides - e.g. { color: '#e11d48', borderRadius: '50%' }
 * @returns {Object|null} Style object or null if empty
 */
export function resolveToolbarItemStyle(overrides) {
  if (!overrides || typeof overrides !== 'object') return null
  const style = {}
  let hasKeys = false
  for (const [key, value] of Object.entries(overrides)) {
    if (key.startsWith('--rmx-')) {
      style[key] = value
      hasKeys = true
    } else if (ITEM_KEY_TO_VAR[key]) {
      style[ITEM_KEY_TO_VAR[key]] = value
      hasKeys = true
    }
  }
  return hasKeys ? style : null
}

/**
 * Convert separator overrides into an inline style object.
 *
 * @param {Object} overrides - e.g. { color: '#ccc', width: '2px' }
 * @returns {Object|null}
 */
export function resolveSeparatorStyle(overrides) {
  if (!overrides || typeof overrides !== 'object') return null
  const style = {}
  let hasKeys = false
  for (const [key, value] of Object.entries(overrides)) {
    if (key.startsWith('--rmx-')) {
      style[key] = value
      hasKeys = true
    } else if (SEPARATOR_KEY_TO_VAR[key]) {
      style[SEPARATOR_KEY_TO_VAR[key]] = value
      hasKeys = true
    }
  }
  return hasKeys ? style : null
}

/**
 * Create a toolbar item theme config.  The returned object can be passed
 * directly to the `toolbarItemTheme` prop on `<RemyxEditor>`.
 *
 * Keys are toolbar command names (e.g. `bold`, `italic`, `headings`) or the
 * special `_separator` key.  Values are objects of per-item style overrides.
 *
 * @param {Object} config - Map of command → style overrides
 * @returns {Object} Resolved config ready for the prop
 *
 * @example
 * const itemTheme = createToolbarItemTheme({
 *   bold:   { color: '#e11d48', activeColor: '#be123c', borderRadius: '50%' },
 *   italic: { background: '#f0f9ff', hoverBackground: '#e0f2fe' },
 *   _separator: { color: '#e2e8f0', width: '2px' },
 * })
 *
 * <RemyxEditor toolbarItemTheme={itemTheme} />
 */
export function createToolbarItemTheme(config) {
  if (!config || typeof config !== 'object') return {}
  const resolved = {}
  for (const [command, overrides] of Object.entries(config)) {
    if (command === '_separator') {
      resolved._separator = resolveSeparatorStyle(overrides)
    } else {
      const style = resolveToolbarItemStyle(overrides)
      if (style) resolved[command] = style
    }
  }
  return resolved
}
