import process from 'node:process'
import args from 'minimist'

interface BaseParseInfo {
  key: string
  alias?: string
  desc?: string
  required?: boolean
  default?: string
}

interface ParseOption extends Omit<BaseParseInfo, 'default'> {
  type?: string | boolean | number
  default?: string | boolean | number
}

export interface ArgsDetail {
  command?: {
    [key: string]: {
      desc?: string
      alias?: string
      argument?: Omit<BaseParseInfo, 'alias'>
      options?: ParseOption[]
    }
  },
  globalOptions?: ParseOption[]
}

function commandTemplate(usage: string, desc?: string, commands?: string[], options?: string[]) {
  return `
Usage: ${usage}
${desc ? `\n${desc}\n` : ''}
${commands && commands.length > 0
      ? `Commands:

${commands.map(c => `  ${c}`).join('\n')}`
      : ''}

${options && options.length > 0
      ? `Options:

${options.map(c => `  ${c}`).join('\n')}`
      : ''}
`
}

export class Commander {
  commands: ArgsDetail = {}
  parseResult: {
    command?: string
    arguments?: string[]
    options?: Record<string, (string | boolean | number)>
  } = {}

  constructor() { }

  /**
   * @param {object[]} options
   * @example
   * [
   *
   * ]
   */
  add(commands: ArgsDetail) {
    this.commands = commands
  }

  validate() {
    if (this.parseResult.command) {
      const curCommand = this.commands.command?.[this.parseResult.command]
      if (!curCommand) {
        throw new Error(`command ${this.parseResult.command} not found`)
      }

      if (curCommand.argument?.required && this.parseResult.arguments?.length === 0) {
        throw new Error(`command ${this.parseResult.command} requires an argument`)
      }

      curCommand.options?.forEach((option) => {
        if (option.required && option.default === undefined && !this.parseResult.options?.[option.key]) {
          throw new Error(`command option ${option.key} requires an argument`)
        }
      })
    }
  }

  _formatOptionType(val: string | boolean | number, type: string | boolean | number) {
    if (type === 'boolean') {
      return !!val
    }
    if (type === 'number') {
      return Number(val)
    }
    if (type === 'string') {
      return String(val)
    }
  }

  _formatOptions(options: ParseOption) {
    if (!options.key) {
      return ''
    }
    const { key, alias, default: _d, type = 'boolean', desc, required } = options
    const d = _d !== undefined ? `=${_d}` : ''
    const arg = `${required ? `<${type}${d}>` : `[${type}${d}]`}`
    return `--${key}${alias ? `,-${alias}` : ''} ${arg}  ${desc}`
  }

  help() {
    const cliName = 'npm'
    const desc = 'hello world'
    const commands = Object.keys(this.commands.command || {}).map(key => `- ${key}`)

    const curCommand = this.parseResult.command && this.commands.command?.[this.parseResult.command]
    if (curCommand) {
      const option = curCommand.options?.map(option => this._formatOptions(option))
      const desc = curCommand.desc
      const usage = `${cliName} ${this.parseResult.command}${curCommand.argument ? ` [${curCommand.argument.key}]` : ''} [flags]`
      const output = commandTemplate(usage, desc, [], option)
      console.log(output)
    }
    else {
      // show global command + options
      const globalOptions = this.commands.globalOptions || []
      const option = globalOptions.map(option => this._formatOptions(option))
      const usage = `${cliName} [command] [flags]`

      const output = commandTemplate(usage, desc, commands, option)

      console.log(output)
    }
  }

  parse(cb?: (commander: Commander) => void) {
    const res = args(process.argv.slice(2))
    const { _, __, ...options } = res
    if (_.length > 0) {
      this.parseResult.command = res._[0]
      this.parseResult.arguments = res._.slice(1)
    }
    const _options = Object.entries(options).reduce((pre, [key, value]) => {
      pre[key] = value
      return pre
    }, {} as Record<string, string | boolean | number>)
    this.parseResult.options = _options

    if (_options.help || _options.h) {
      this.help()
    }
    else {
      this.validate()
      cb?.(this)
    }
  }
}
