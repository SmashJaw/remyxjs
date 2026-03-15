export function registerAlignmentCommands(engine) {
  engine.commands.register('alignLeft', {
    execute() { document.execCommand('justifyLeft', false, null) },
    isActive(eng) {
      const block = eng.selection.getParentBlock()
      if (!block) return false
      const align = block.style.textAlign || window.getComputedStyle(block).textAlign
      return !align || align === 'left' || align === 'start'
    },
    meta: { icon: 'alignLeft', tooltip: 'Align Left' },
  })

  engine.commands.register('alignCenter', {
    execute() { document.execCommand('justifyCenter', false, null) },
    isActive(eng) {
      const block = eng.selection.getParentBlock()
      if (!block) return false
      const align = block.style.textAlign || window.getComputedStyle(block).textAlign
      return align === 'center'
    },
    meta: { icon: 'alignCenter', tooltip: 'Align Center' },
  })

  engine.commands.register('alignRight', {
    execute() { document.execCommand('justifyRight', false, null) },
    isActive(eng) {
      const block = eng.selection.getParentBlock()
      if (!block) return false
      const align = block.style.textAlign || window.getComputedStyle(block).textAlign
      return align === 'right' || align === 'end'
    },
    meta: { icon: 'alignRight', tooltip: 'Align Right' },
  })

  engine.commands.register('alignJustify', {
    execute() { document.execCommand('justifyFull', false, null) },
    isActive(eng) {
      const block = eng.selection.getParentBlock()
      if (!block) return false
      const align = block.style.textAlign || window.getComputedStyle(block).textAlign
      return align === 'justify'
    },
    meta: { icon: 'alignJustify', tooltip: 'Justify' },
  })
}
