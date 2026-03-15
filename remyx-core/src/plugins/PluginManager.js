export class PluginManager {
  constructor(engine) {
    this.engine = engine
    this._plugins = new Map()
  }

  register(plugin) {
    if (!plugin || !plugin.name) {
      console.warn('Plugin must have a name')
      return
    }
    if (this._plugins.has(plugin.name)) {
      console.warn(`Plugin "${plugin.name}" already registered`)
      return
    }
    this._plugins.set(plugin.name, plugin)

    // Register any commands the plugin provides
    if (plugin.commands) {
      plugin.commands.forEach((cmd) => {
        this.engine.commands.register(cmd.name, cmd)
      })
    }

    this.engine.eventBus.emit('plugin:registered', { name: plugin.name })
  }

  initAll() {
    this._plugins.forEach((plugin) => {
      try {
        if (plugin.init) plugin.init(this.engine)
      } catch (err) {
        console.error(`Error initializing plugin "${plugin.name}":`, err)
      }
    })
  }

  destroyAll() {
    this._plugins.forEach((plugin) => {
      try {
        if (plugin.destroy) plugin.destroy(this.engine)
      } catch (err) {
        console.error(`Error destroying plugin "${plugin.name}":`, err)
      }
    })
    this._plugins.clear()
  }

  get(name) {
    return this._plugins.get(name)
  }

  getAll() {
    return Array.from(this._plugins.values())
  }

  has(name) {
    return this._plugins.has(name)
  }
}
