import process, { config } from 'node:process'
import { resolve } from 'node:path'
import type { Command } from 'commander'
import { confirm, multiselect, password, select, text } from '@clack/prompts'
import Configstore from 'configstore'
import type { PackageJson } from '../types/package'
import { findNearestPackageJson, transformOptions } from './utils'
import { createStore } from './utils/store'
import { Log, debugLog } from './utils/log'
import type { ArgsDetail } from './utils/argsParse'
import { Commander } from './utils/argsParse'
import { Template } from './mixin/template'

type Config<S extends Record<string, any>, C extends ArgsDetail, P extends (new (...args: any[]) => any)[] = []> = {
  [K in keyof C['command'] as `on${Capitalize<string & K>}`]?: any
} & {
  [K in typeof lifeCycle[number]]?: (ctx: ShellKit<S, C>) => Promise<void>
} & {
  templatePath?: string
  store?: S
  key?: string
  plugins?: P
  subConfig?: (Config<any, any>)[]
  command?: C
  parseArg?: (ctx: ShellKit<S, C>) => void
}

type UnionToIntersection<U> =
 (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never


type MixinClass<T extends (new (...args: any[]) => any)[]> = UnionToIntersection<InstanceType<T[number]>>

// 生命周期
const lifeCycle = [
  'setup',
  'beforePrompt',
  'prompt',
  'afterPrompt',
  'beforeCopy',
  'copy',
  'afterCopy',
  'beforeInstall',
  'install',
  'afterInstall',
  'custom',
  'end',
] as const

export class ShellKit<S extends Record<string, any> = object, C extends ArgsDetail = object> {
  #pkgJson: PackageJson = {}
  #program: Command | null = null
  #config?: Config<S, C>
  store: S
  localStore: Configstore | null = null
  command: Commander
  #rootPath: string
  #destPath: string
  #templatePath: string

  getRootPath(path = '') {
    return resolve(this.#rootPath, path)
  }

  getDestPath(path = '') {
    return resolve(this.#destPath, path)
  }

  getTemplatePath(path = '') {
    return resolve(this.#templatePath, path)
  }

  // static mixin<T extends Record<string, (...args: any[]) => any>>(
  //   this: new () => ShellKit,
  //   methods: T,
  // ): ArrayValueCheck<T, new () => ShellKit & MixinMethods<T>, new () => ShellKit> {
  //   Object.entries(methods).forEach(([name, method]) => {
  //     (this.prototype as any)[name] = function (this: ShellKit, ...args: any[]) {
  //       return method.apply(this, args)
  //     }
  //   })
  //   return this as any
  // }

  static mixinClass<T extends (new (...args: any[]) => any)[]>(
    plugins: T,
  ) {
    for (const SourceCtor of plugins) {
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

  constructor(config?: Config<S, C>) {
    this.#config = config
    this.#rootPath = this.#destPath = process.cwd()
    this.#templatePath = config?.templatePath || './template'
    this.command = new Commander()
    this.store = createStore(this.#config?.store)
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

    if (this.#config?.key || json.name) {
      this.localStore = new Configstore(json.name, initialLocalStore)
    }
  }

  setDestPath(destPath: string) {
    this.#destPath = destPath
    debugLog('info', 'currentDestPath change to:', destPath)
  }

  setRootPath(rootPath: string) {
    this.#rootPath = rootPath
    debugLog('info', 'currentRootPath change to:', rootPath)
  }

  setTemplatePath(templatePath: string) {
    this.#templatePath = templatePath
    debugLog('info', 'currentTemplatePath change to:', templatePath)
  }

  async run() {
    for await (const name of lifeCycle) {
      if (this.#config?.[name]) {
        this.#config?.[name]?.call(this, this)
      }
    }
  }
}

export default function makeApplication<S extends Record<string, any>, C extends ArgsDetail, P extends (new () => any)[] = [] >(config: Config<S, C, P>) {
  const { plugins, ...restConfig } = config
  const NShellKit = ShellKit.mixinClass(config.plugins || [])
  return new NShellKit(restConfig as Config<Record<string, any>, C, []>) as ShellKit<S, C> & MixinClass<P>
}
