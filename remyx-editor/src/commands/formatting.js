export function registerFormattingCommands(engine) {
  engine.commands.register('bold', {
    execute() { document.execCommand('bold', false, null) },
    isActive() { return document.queryCommandState('bold') },
    shortcut: 'mod+b',
    meta: { icon: 'bold', tooltip: 'Bold' },
  })

  engine.commands.register('italic', {
    execute() { document.execCommand('italic', false, null) },
    isActive() { return document.queryCommandState('italic') },
    shortcut: 'mod+i',
    meta: { icon: 'italic', tooltip: 'Italic' },
  })

  engine.commands.register('underline', {
    execute() { document.execCommand('underline', false, null) },
    isActive() { return document.queryCommandState('underline') },
    shortcut: 'mod+u',
    meta: { icon: 'underline', tooltip: 'Underline' },
  })

  engine.commands.register('strikethrough', {
    execute() { document.execCommand('strikeThrough', false, null) },
    isActive() { return document.queryCommandState('strikeThrough') },
    shortcut: 'mod+shift+x',
    meta: { icon: 'strikethrough', tooltip: 'Strikethrough' },
  })

  engine.commands.register('subscript', {
    execute() { document.execCommand('subscript', false, null) },
    isActive() { return document.queryCommandState('subscript') },
    shortcut: 'mod+,',
    meta: { icon: 'subscript', tooltip: 'Subscript' },
  })

  engine.commands.register('superscript', {
    execute() { document.execCommand('superscript', false, null) },
    isActive() { return document.queryCommandState('superscript') },
    shortcut: 'mod+.',
    meta: { icon: 'superscript', tooltip: 'Superscript' },
  })

  engine.commands.register('removeFormat', {
    execute() { document.execCommand('removeFormat', false, null) },
    meta: { icon: 'removeFormat', tooltip: 'Remove Formatting' },
  })
}
