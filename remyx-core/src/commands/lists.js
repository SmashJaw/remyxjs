export function registerListCommands(engine) {
  engine.commands.register('orderedList', {
    execute() { document.execCommand('insertOrderedList', false, null) },
    isActive(eng) {
      return !!eng.selection.getClosestElement('ol')
    },
    shortcut: 'mod+shift+7',
    meta: { icon: 'orderedList', tooltip: 'Numbered List' },
  })

  engine.commands.register('unorderedList', {
    execute() { document.execCommand('insertUnorderedList', false, null) },
    isActive(eng) {
      const ul = eng.selection.getClosestElement('ul')
      if (!ul) return false
      // Don't count task lists as regular unordered lists
      return !ul.classList.contains('rmx-task-list')
    },
    shortcut: 'mod+shift+8',
    meta: { icon: 'unorderedList', tooltip: 'Bulleted List' },
  })

  engine.commands.register('taskList', {
    execute(eng) {
      const existingUl = eng.selection.getClosestElement('ul')
      if (existingUl && existingUl.classList.contains('rmx-task-list')) {
        // Remove task list - convert back to regular list
        existingUl.classList.remove('rmx-task-list')
        existingUl.querySelectorAll('.rmx-task-checkbox').forEach((cb) => cb.remove())
        return
      }

      // If not in a list, create one
      if (!existingUl) {
        document.execCommand('insertUnorderedList', false, null)
      }

      const ul = eng.selection.getClosestElement('ul')
      if (!ul) return

      ul.classList.add('rmx-task-list')
      ul.querySelectorAll('li').forEach((li) => {
        if (!li.querySelector('.rmx-task-checkbox')) {
          const checkbox = document.createElement('input')
          checkbox.type = 'checkbox'
          checkbox.className = 'rmx-task-checkbox'
          checkbox.setAttribute('contenteditable', 'false')
          li.insertBefore(checkbox, li.firstChild)
        }
      })
    },
    isActive(eng) {
      const ul = eng.selection.getClosestElement('ul')
      return ul && ul.classList.contains('rmx-task-list')
    },
    meta: { icon: 'taskList', tooltip: 'Task List' },
  })

  engine.commands.register('indent', {
    execute() { document.execCommand('indent', false, null) },
    meta: { icon: 'indent', tooltip: 'Increase Indent' },
  })

  engine.commands.register('outdent', {
    execute() { document.execCommand('outdent', false, null) },
    meta: { icon: 'outdent', tooltip: 'Decrease Indent' },
  })
}
