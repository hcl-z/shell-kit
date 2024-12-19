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
  id: string
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
    prefix?: string
  },
  // config
  {
    commands: Map<string, CommandBuilder>
    globalOptions: Map<string, Option>
  },
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
    prefix: '',
  },
  config: {
    commands: new Map(),
    globalOptions: new Map(),
  },
}).extend(({ config }) => {
  return {
    addCommand(command: Command) {
      const builder = new CommandBuilder(command)
      config.commands.set(command.name, builder)
      return this
    },

    addOption(option: Option | Option[]) {
      if (Array.isArray(option)) {
        option.forEach((item) => {
          config.globalOptions.set(item.name, item)
        })
      }
      else {
        config.globalOptions.set(option.name, option)
      }
      return this
    },

    parse() {
      let yargsInstance = yargs(hideBin(process.argv))

      // 添加全局参数
      config.globalOptions.forEach((option) => {
        yargsInstance = yargsInstance.option(option.name, {
          describe: option.description,
          demandOption: option.required,
          default: option.default,
          alias: option.alias,
        })
      })

      // 添加子命令
      config.commands.forEach((ins) => {
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
              else if (config.globalOptions.has(key)) {
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
