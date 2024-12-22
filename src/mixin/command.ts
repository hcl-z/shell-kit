import process from 'node:process'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import type { CreateMixinOptions } from '../utils/mixin'
import { createMixin } from '../utils/mixin'

export interface Argument {
  name: string
  description?: string
  required?: boolean
  default?: any
  alias?: string
}

interface Option {
  name: string
  alias?: string
  description?: string
  type?: 'boolean' | 'string' | 'number'
  default?: any
  required?: boolean
}

interface CommandParams {
  args: Record<string, any>
  options: Record<string, any>
  globalOptions: Record<string, any>
}
export interface Command {
  name: string
  description?: string
  alias?: string
  callback: (params: CommandParams) => void
}

class CommandBuilder {
  command: Command
  args: Argument[] = []
  options: Option[] = []
  constructor(command: Command) {
    this.command = command
  }

  addOptions(option: Option | Option[]): CommandBuilder {
    if (!this.options) {
      this.options = []
    }
    this.options.push(...Array.isArray(option) ? option : [option])
    return this
  }

  addArguments(args: Argument | Argument[]): CommandBuilder {
    if (!this.args) {
      this.args = []
    }
    this.args.push(...Array.isArray(args) ? args : [args])
    return this
  }
}

// 定义 CommandMixin 的类型
type CommandMixinType = CreateMixinOptions<'command', {
  commands: Record<string, CommandBuilder>
  globalOptions: Record<string, Option>
}, {
  locale?: string
  usage?: string
}, object, {
  addCommand: (command: Command) => CommandBuilder
  addOption: (option: Option | Option[]) => any
  parse: () => void
}>

export const CommandMixin = createMixin<CommandMixinType>({
  key: 'command',
  options: {
    commands: {},
    globalOptions: {},
  },
}).extendGlobalMethods(({ getOption, setOption, config }) => {
  return {
    addCommand(command: Command) {
      const commands = getOption('commands')
      const builder = new CommandBuilder(command)
      setOption('commands', { ...commands, [command.name]: builder })
      return builder
    },

    addOption(option: Option | Option[]) {
      const globalOptions = getOption('globalOptions')
      if (Array.isArray(option)) {
        option.forEach((item) => {
          globalOptions[item.name] = item
        })
      }
      else {
        globalOptions[option.name] = option
      }
      setOption('globalOptions', globalOptions)
      return this
    },

    parse() {
      const yargsInstance = yargs(hideBin(process.argv))

      const globalOptions = getOption('globalOptions')
      const commands = getOption('commands')

      if (config.locale) {
        yargsInstance.locale(config.locale)
      }

      if (config.usage) {
        yargsInstance.usage(config.usage)
      }

      Object.values(globalOptions).forEach((option) => {
        yargsInstance.option(option.name, {
          describe: option.description,
          demandOption: option.required,
          default: option.default,
          alias: option.alias,
        })
      })

      Object.values(commands).forEach((ins) => {
        const cmd = ins.command
        const options = ins.options
        const args = ins.args

        yargsInstance.command({
          command: cmd.name,
          describe: cmd.description,
          builder: (yargs: yargs.Argv) => {
            args.forEach((arg) => {
              yargs.option(arg.name, {
                describe: arg.description,
                demandOption: arg.required,
                default: arg.default,
                alias: arg.alias,
              })
            })
            options.forEach((option) => {
              yargs.positional(option.name, {
                describe: option.description,
                demandOption: option.required,
                default: option.default,
                alias: option.alias,
              })
            })
            return yargs
          },
          handler: (argv: Record<string, any>) => {
            const params = Object.entries(argv).reduce((params, [key, value]) => {
              if (globalOptions[key]) {
                params.globalOptions[key] = value
              }
              else if (options.find(option => option.name === key)) {
                params.options[key] = value
              }
              else if (args.find(arg => arg.name === key)) {
                params.args[key] = value
              }
              return params
            }, {
              args: {},
              options: {},
              globalOptions: {},
            } as CommandParams)

            return cmd?.callback(params)
          },
        })
      })

      return yargsInstance.parse()
    },
  }
})
