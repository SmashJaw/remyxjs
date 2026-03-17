import { isMac } from '../utils/platform.js'

export const BUTTON_COMMANDS = new Set([
  'bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript',
  'alignLeft', 'alignCenter', 'alignRight', 'alignJustify',
  'orderedList', 'unorderedList', 'taskList',
  'blockquote', 'codeBlock', 'horizontalRule',
  'undo', 'redo', 'removeFormat',
  'indent', 'outdent',
  'fullscreen', 'sourceMode', 'toggleMarkdown',
])

export const TOOLTIP_MAP = {
  bold: 'Bold', italic: 'Italic', underline: 'Underline', strikethrough: 'Strikethrough',
  subscript: 'Subscript', superscript: 'Superscript',
  alignLeft: 'Align Left', alignCenter: 'Align Center', alignRight: 'Align Right', alignJustify: 'Justify',
  orderedList: 'Numbered List', unorderedList: 'Bulleted List', taskList: 'Task List',
  blockquote: 'Blockquote', codeBlock: 'Code Block', horizontalRule: 'Horizontal Rule',
  undo: 'Undo', redo: 'Redo', removeFormat: 'Remove Formatting',
  indent: 'Indent', outdent: 'Outdent',
  link: 'Insert Link', image: 'Insert Image', attachment: 'Attach File', table: 'Insert Table',
  importDocument: 'Import Document',
  embedMedia: 'Embed Media', findReplace: 'Find & Replace',
  fullscreen: 'Fullscreen', sourceMode: 'Source Code',
  toggleMarkdown: 'Toggle Markdown', export: 'Export Document',
  foreColor: 'Text Color', backColor: 'Background Color',
  headings: 'Block Type', fontFamily: 'Font Family', fontSize: 'Font Size',
  commandPalette: 'Command Palette',
}

export const SHORTCUT_MAP = {
  bold: 'mod+B', italic: 'mod+I', underline: 'mod+U',
  strikethrough: 'mod+Shift+X', undo: 'mod+Z', redo: 'mod+Shift+Z',
  insertLink: 'mod+K', findReplace: 'mod+F',
  fullscreen: 'mod+Shift+F', sourceMode: 'mod+Shift+U',
  commandPalette: 'mod+Shift+P',
}

/** Commands that trigger modals instead of direct execution */
export const MODAL_COMMANDS = {
  link: 'link',
  image: 'image',
  attachment: 'attachment',
  importDocument: 'importDocument',
  table: 'table',
  embedMedia: 'embed',
  findReplace: 'findReplace',
  export: 'export',
}

export function getShortcutLabel(command) {
  const shortcut = SHORTCUT_MAP[command]
  if (!shortcut) return ''
  return shortcut.replace(/mod/g, isMac() ? '⌘' : 'Ctrl')
}

/**
 * Get the active state for a command from selectionState + engine.
 */
export function getCommandActiveState(command, selectionState, engine) {
  switch (command) {
    case 'bold': return selectionState.bold
    case 'italic': return selectionState.italic
    case 'underline': return selectionState.underline
    case 'strikethrough': return selectionState.strikethrough
    case 'subscript': return selectionState.subscript
    case 'superscript': return selectionState.superscript
    case 'alignLeft': return selectionState.alignment === 'left'
    case 'alignCenter': return selectionState.alignment === 'center'
    case 'alignRight': return selectionState.alignment === 'right'
    case 'alignJustify': return selectionState.alignment === 'justify'
    case 'orderedList': return selectionState.orderedList
    case 'unorderedList': return selectionState.unorderedList
    case 'blockquote': return selectionState.blockquote
    case 'codeBlock': return selectionState.codeBlock
    case 'sourceMode': return engine?.isSourceMode
    case 'toggleMarkdown': return engine?.isMarkdownMode
    case 'fullscreen': return engine?.element?.closest('.rmx-editor')?.classList.contains('rmx-fullscreen')
    default: return false
  }
}
