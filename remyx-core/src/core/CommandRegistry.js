export class CommandRegistry {
  constructor(engine) {
    this.engine = engine
    this._commands = new Map()
  }

  register(name, command) {
    this._commands.set(name, {
      name,
      execute: command.execute,
      isActive: command.isActive || (() => false),
      isEnabled: command.isEnabled || (() => true),
      shortcut: command.shortcut || null,
      meta: command.meta || {},
    })

    if (command.shortcut) {
      this.engine.keyboard.register(command.shortcut, name)
    }
  }

  execute(name, ...args) {
    const command = this._commands.get(name)
    if (!command) {
      console.warn(`Command "${name}" not found`)
      return false
    }
    if (!command.isEnabled(this.engine)) {
      return false
    }

    this.engine.history.snapshot()
    const result = command.execute(this.engine, ...args)
    this.engine.eventBus.emit('command:executed', { name, args, result })
    this.engine.eventBus.emit('content:change')
    return result
  }

  isActive(name) {
    const command = this._commands.get(name)
    if (!command) return false
    return command.isActive(this.engine)
  }

  isEnabled(name) {
    const command = this._commands.get(name)
    if (!command) return false
    return command.isEnabled(this.engine)
  }

  get(name) {
    return this._commands.get(name)
  }

  getAll() {
    return Array.from(this._commands.keys())
  }

  has(name) {
    return this._commands.has(name)
  }
}
