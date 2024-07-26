import process from 'node:process'
import type { Command } from 'commander'
import { confirm, multiselect, password, select, text } from '@clack/prompts'
import Configstore from 'configstore'
import type { PackageJson } from '../types/package'
import { findNearestPackageJson, transformOptions } from './utils'
import { createStore } from './utils/store'
import { Log } from './utils/log'
import { Commander } from './utils/argsParse'
import { Npm } from './utils/shell'
import { resolve } from 'node:path'

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
type UnionToIntersection<U> =
 (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

type MixinMethods<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? T[K] : never;
}

type MixinClass<T extends (new (...args: any[]) => any)[]> = UnionToIntersection<InstanceType<T[number]>>

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

  getRootPath(path=''){
    return resolve(this.#rootPath,path)
  }

  getDestPath(path=''){
    return resolve(this.#destPath,path)
  }

  getTemplatePath(path=''){
    return resolve(this.#templatePath,path)
  }
  
  static mixin<T extends Record<string, (...args: any[]) => any>>(
    this: new () => ShellKit,
    methods: T,
  ): new () => ShellKit & MixinMethods<T> {
    Object.entries(methods).forEach(([name, method]) => {
      (this.prototype as any)[name] = function (this: ShellKit, ...args: any[]) {
        return method.apply(this, args)
      }
    })
    return this as any
  }

  static mixinClass<T extends (new (...args: any[]) => any)[]>(
    this: new () => ShellKit,
    ...methods: T
  ): new () => ShellKit & MixinClass<T> {
    for (const SourceCtor of methods) {
      const props = Object.getOwnPropertyDescriptors(new SourceCtor())
      Object.defineProperties(this.prototype, props)
      for (const name of Object.getOwnPropertyNames(SourceCtor.prototype)) {
        Object.defineProperty(
          this.prototype,
          name,
          Object.getOwnPropertyDescriptor(SourceCtor.prototype, name) ?? Object.create(null),
        )
      }
    }
    return this as any
  }

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
