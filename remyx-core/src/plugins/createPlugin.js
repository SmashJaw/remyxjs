export function createPlugin(definition) {
  return {
    name: definition.name,
    init: definition.init || (() => {}),
    destroy: definition.destroy || (() => {}),
    commands: definition.commands || [],
    toolbarItems: definition.toolbarItems || [],
    statusBarItems: definition.statusBarItems || [],
    contextMenuItems: definition.contextMenuItems || [],
  }
}
