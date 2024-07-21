import process from 'node:process'
import { Command, program } from 'commander'
import { confirm, multiselect, password, select, text } from '@clack/prompts'
import Configstore from 'configstore'
import type { PackageJson } from '../types/package'
import { findNearestPackageJson, transformOptions } from './utils'
import { createStore } from './utils/store'
import { Log } from './utils/log'
import { Commander } from './utils/argsParse'

interface CommandOption {
  type: 'command'
  key: string
  desc?: string
  options: OptionWithAlias[]
  argument: OptionWithArgument
}

interface OptionWithArgument {
  key: string
  desc?: string
}

interface OptionWithAlias {
  type: 'option'
  key: string
  desc?: string
  alias?: string
  default?: string
  required?: boolean
}

type Options = (CommandOption | OptionWithAlias)[]

interface OptionConfig {
  notShowCliInfo?: boolean
  cliInfo?: {
    name?: string
    description?: string
    version?: string
  }
}

interface BasePrompt {
  key: string
  message: string
  store?: boolean
  enabled?: boolean
}
interface TextPrompt extends BasePrompt {
  type: 'text'
  default?: string
  placeholder?: string
  required?: boolean
  callback?: (value: string) => void
}

interface PasswordPrompt extends Omit<BasePrompt, 'store'> {
  type: 'password'
  mask?: string
  required?: boolean
  callback?: (value: string) => void
}

interface SelectPrompt extends BasePrompt {
  type: 'select'
  mulitiple?: boolean
  default?: string
  required?: boolean
  choices: ({
    label: string
    value: string
    description?: string
  } | string)[]
  callback?: (value: string | string[]) => void
}

interface ConfirmPrompt extends BasePrompt {
  type: 'confirm'
  active?: string
  inactive?: string
  default?: boolean
  callback?: (value: boolean) => void
}

type PromptType = TextPrompt | PasswordPrompt | SelectPrompt | ConfirmPrompt

interface Config<S extends Record<string, any>> {
  templatePath?: string
  store?: S
  key?: string
  prompt?: (ctx: ShellKit<S>) => void
  setup?: (ctx: ShellKit<S>) => void
  parseArg?: (ctx: ShellKit<S>) => void

  [key: string]: any
}

export class ShellKit<S extends Record<string, any> = Record<string, any>> {
  #pkgJson: PackageJson = {}
  #program: Command | null = null
  store: S | null = null
  localStore: Configstore | null = null
  command: Commander
  #config?: Config<S>
  #rootPath: string
  #destPath: string
  #templatePath: string

  constructor(config?: Config<S>) {
    this.#config = config
    this.#rootPath = this.#destPath = process.cwd()
    this.#templatePath = config?.templatePath || './template'
    this.command = new Commander()
    this.init().then(() => {
      this.run()
    },
    )
  }

  async init() {
    // todo default 收集
    const initialLocalStore = {
      default: {

      },
      // 简单加密
      secret: {

      },
    }
    const json = await findNearestPackageJson()
    this.#pkgJson = json
    this.store = createStore(this.#config?.store)
    if (this.#config?.key || json.name) {
      this.localStore = new Configstore(json.name, initialLocalStore)
    }
  }

  debugLog(type: 'info' | 'warn' | 'error', ...args: any[]) {
    if (this.Opt?.debug) {
      Log?.[type]?.(...args)
    }
  }

  setDestPath(destPath: string) {
    this.#destPath = destPath
    this.debugLog('info', 'currentDestPath change to:', destPath)
  }

  setRootPath(rootPath: string) {
    this.#rootPath = rootPath
    this.debugLog('info', 'currentRootPath change to:', rootPath)
  }

  setTemplatePath(templatePath: string) {
    this.#templatePath = templatePath
    this.debugLog('info', 'currentTemplatePath change to:', templatePath)
  }

  async run() {
    // parse
    await this.#config?.setup?.call(this, this)
    // prompt
    await this.#config?.prompt?.call(this, this)
    // template
    // await this.#config?.setup?.call(this, this)
    // package
    // end
  }

  options(options: Options, config?: OptionConfig) {
    const p = new Command()
    // show cli info
    if (!config?.notShowCliInfo) {
      const { name, description, version } = {
        name: config?.cliInfo?.name || this.#pkgJson.name,
        description: config?.cliInfo?.description || this.#pkgJson.description,
        version: config?.cliInfo?.version || this.#pkgJson.version,
      }
      name && p.name(name)
      description && p.description(description)
      version && p.version(version)
    }

    const formatOption = (option: OptionWithAlias) => {
      const flag = `${option.alias && `-${option.alias},`}--${option.key}`

      if (option.required) {
        p.requiredOption(flag, option.desc, option.default)
      }
      else {
        p.option(flag, option.desc, option.default)
      }
    }

    // add options
    options.forEach((option) => {
      if (option.type === 'command') {
        const command = p.command('clone <source> [destination]')
        command.action((arg, options) => {
          // console.log(arg, options)
          // TODO
          this.#config?.[`${option.key}Command`]?.apply(this, [arg, options])
        })
      }
      else if (option.type === 'option') {
        formatOption.apply(p, [option])
      }
    })

    console.log('parse')
    this.#program = p.parse(process.argv)
  }

  get Opt() {
    return this.#program?.opts()
  }

  async prompt(promptList: PromptType[]) {
    for (const item of promptList) {
      let res
      switch (item.type) {
        case 'text':
          res = await text({
            message: item.message,
            placeholder: item.placeholder,
            defaultValue: item.default,
          })
          item?.callback?.(res as string)
          break
        case 'password':
          res = await password({
            message: item.message,
            mask: item.mask,
          })
          item?.callback?.(res as string)
          break
        case 'select':
          const fn = item.mulitiple ? multiselect : select
          res = await fn({
            message: item.message,
            options: transformOptions(item.choices),
            initialValue: item.default,
            required: item.required,
          })
          item?.callback?.(res as (string | string[]))
          break
        case 'confirm':
          res = await confirm({
            message: item.message,
            active: item.active,
            inactive: item.inactive,
            initialValue: item.default,
          })
          item?.callback?.(res as boolean)
          break
      }
    }
  }
}

export * from './utils/fs'
export * from './utils/log'
