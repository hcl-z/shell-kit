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

export interface Command {
  name: string
  description?: string
  args?: Argument[]
  callback: (args: Record<string, any>, flags: Record<string, any>, globalOptions: Record<string, any>) => void
}

// 新增用于链式调用的命令构建器
class CommandBuilder {
  private command: Command
  constructor(command: Command) {
    this.command = command
  }

  addArgument(arg: Argument): CommandBuilder {
    if (!this.command.args) {
      this.command.args = []
    }
    this.command.args.push(arg)
    return this
  }

  getCommand(): Command {
    return this.command
  }
}

// 定义 CommandMixin 的类型
type CommandMixinType = CreateMixinOptions<'command',
  // options
  {
    commands: Record<string, CommandBuilder>
    globalOptions: Record<string, Option>
  },
  // config
  {
    prefix?: string
  }, object,
  // methods
  {
    addCommand: (command: Command) => any
    addOption: (option: Option | Option[]) => any
    parse: () => void
  }>

// 使用 createMixin 创建 mixin
export const CommandMixin = createMixin<CommandMixinType>({
  key: 'command',
  options: {
    commands: {},
    globalOptions: {},
  },
  config: {
    prefix: '',
  },
}).extendGlobalMethods(({ getOption, setOption }) => {
  return {
    addCommand(command: Command) {
      const commands = getOption('commands')
      const builder = new CommandBuilder(command)
      setOption('commands', { ...commands, [command.name]: builder })
      return this
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
      console.log('globalOptions', globalOptions)

      setOption('globalOptions', globalOptions)
      return this
    },

    parse() {
      let yargsInstance = yargs(hideBin(process.argv))

      yargsInstance.help('help')
        .alias('help', 'h')
        .version('version').alias('version', 'V')

      const globalOptions = getOption('globalOptions')
      const commands = getOption('commands')

      // 添加全局参数
      Object.values(globalOptions).forEach((option) => {
        yargsInstance = yargsInstance.option(option.name, {
          describe: option.description,
          demandOption: option.required,
          default: option.default,
          alias: option.alias,
        })
      })

      // 添加子命令
      Object.values(commands).forEach((ins) => {
        const cmd = ins.getCommand()
        yargsInstance = yargsInstance.command({
          command: cmd.name,
          describe: cmd.description,
          builder: (yargs) => {
            cmd.args?.forEach((arg) => {
              yargs.option(arg.name, {
                describe: arg.description,
                demandOption: arg.required,
                default: arg.default,
                alias: arg.alias,
              })
            })
            return yargs
          },
          handler: (argv) => {
            const args: Record<string, any> = {}
            const flags: Record<string, any> = {}
            const globalOptions: Record<string, any> = {}

            // 分离参数
            Object.entries(argv).forEach(([key, value]) => {
              if (cmd.args?.some(arg => arg.name === key)) {
                args[key] = value
              }
              else if (globalOptions[key]) {
                globalOptions[key] = value
              }
              else {
                flags[key] = value
              }
            })

            return cmd.callback(args, flags, globalOptions)
          },
        })
      })
      return yargsInstance.parse()
    },
  }
})
