export function registerHeadingCommands(engine) {
  engine.commands.register('heading', {
    execute(eng, level) {
      const tag = level === 'p' ? 'p' : `h${level}`
      document.execCommand('formatBlock', false, `<${tag}>`)
    },
    isActive(eng) {
      const block = eng.selection.getParentBlock()
      if (!block) return false
      return /^H[1-6]$/.test(block.tagName) ? block.tagName.toLowerCase() : false
    },
    meta: { icon: 'heading', tooltip: 'Heading' },
  })

  // Individual heading commands for convenience
  for (let i = 1; i <= 6; i++) {
    engine.commands.register(`h${i}`, {
      execute() { document.execCommand('formatBlock', false, `<h${i}>`) },
      isActive(eng) {
        const block = eng.selection.getParentBlock()
        return block && block.tagName === `H${i}`
      },
      meta: { tooltip: `Heading ${i}` },
    })
  }

  engine.commands.register('paragraph', {
    execute() { document.execCommand('formatBlock', false, '<p>') },
    isActive(eng) {
      const block = eng.selection.getParentBlock()
      return block && block.tagName === 'P'
    },
    meta: { tooltip: 'Normal text' },
  })
}
