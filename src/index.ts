import { resolve } from 'node:path'
import process from 'node:process'
import Configstore from 'configstore'
import type { Command } from 'commander'
import type { PackageJson } from '../types/package'
import { createStore } from './utils/store'
import { debugLog } from './utils/log'
import type { ArgsDetail } from './utils/argsParse'
import { Commander } from './utils/argsParse'
import type { Mixin, MixinMethodParams } from './utils/mixin'
import { CommandMixin, FsMixin, PackageMixin, PromptMixin } from './mixin'
import { TemplateMixin } from './mixin/template'
import type { ExtendPromptObject } from './mixin/prompt'
import { findNearestPackageJson, validateEmail } from './utils'

type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

type ExtractMixinMethods<T extends Mixin<any>> = T extends Mixin<infer R> ? {
  [K in R['key']]: R['methods']
} : never

type ExtractMixinGlobalMethods<T extends Mixin<any>> = T extends Mixin<infer R> ? {
  [K in keyof R['globalMethods']]: R['globalMethods'][K]
} : never

type InferMixinMethods<T extends readonly Mixin<any>[]> = UnionToIntersection<{
  [K in keyof T]: ExtractMixinMethods<T[K]>
}[number]>

type InferMixinGlobalMethods<T extends readonly Mixin<any>[]> = UnionToIntersection<{
  [K in keyof T]: ExtractMixinGlobalMethods<T[K]>
}[number]>

interface LocalInfo {
  user: string
  email: string
}

interface ShellKitConfig<M extends readonly Mixin<any>[]> {
  mixins?: M
  store?: Record<string, any>
  command?: ArgsDetail
  templatePath?: string
  key?: string
  /**
   * @description 文件名前缀,用于标识该文件需要执行逻辑判断是否拷贝
   */
  prefix?: string
  /**
   * @description 文件名后缀,用于标识该文件需要被模版引擎处理
   */
  suffix?: string
}

type ShellkitContext<M extends readonly Mixin<any>[]> = ShellKit<M> & InferMixinMethods<M> & InferMixinGlobalMethods<M>

/**
 *  core class
 */
export class ShellKit<M extends readonly Mixin<any>[] = []> {
  public readonly store: Record<string, any>
  public readonly localStore: Configstore | null
  public readonly command: Commander
  public readonly rootPath: string
  public readonly localInfo: LocalInfo = { user: '', email: '' }
  public readonly destPath: string
  public readonly templatePath: string
  public readonly pkgJson: PackageJson = {}

  private readonly mixinStore: Record<string, any> = {}

  constructor(private readonly config: ShellKitConfig<M>) {
    this.store = createStore(config.store || {})
    this.localStore = null
    this.command = new Commander()
    this.rootPath = process.cwd()
    this.destPath = process.cwd()
    this.templatePath = config.templatePath || './template'

    this.initStore()
    this.initMixins((config.mixins || []) as M)
  }

  public getRootPath(path = ''): string {
    return resolve(this.rootPath, path)
  }

  public getDestPath(path = ''): string {
    return resolve(this.destPath, path)
  }

  public getTemplatePath(path = ''): string {
    return resolve(this.templatePath, path)
  }

  public setRootPath(path: string): void {
    (this as any).rootPath = path
    debugLog('info', 'currentRootPath change to:', path)
  }

  public setDestPath(path: string): void {
    (this as any).destPath = path
    debugLog('info', 'currentDestPath change to:', path)
  }

  public setTemplatePath(path: string): void {
    (this as any).templatePath = path
    debugLog('info', 'currentTemplatePath change to:', path)
  }

  private initStore(): void {
    const json = findNearestPackageJson()
      ; (this as any).pkgJson = json

    if (this.config.key || json.name) {
      ; (this as any).localStore = new Configstore(json.name)
    }
  }

  private initMixins(mixins: M): void {
    mixins.forEach((mixin) => {
      const { key, options, config, methodsBuilder, globalMethodsBuilder } = mixin
      this.mixinStore[key] = { options, config }

      const getMixinOption = (optionKey: string) => {
        return this.mixinStore[key]?.options[optionKey]
      }
      const setMixinOption = (optionKey: string, value: any) => {
        this.mixinStore[key].options[optionKey] = value
      }

      const methodContext = {
        ctx: this,
        getOption: getMixinOption.bind(this),
        setOption: setMixinOption.bind(this),
        config: this.mixinStore[key].config,
      } as MixinMethodParams<typeof config, typeof options>

      const mixinMethods = methodsBuilder?.(methodContext)
      const globalMixinMethods = globalMethodsBuilder?.(methodContext)

      if (mixinMethods) {
        Object.assign(this, {
          [key]: mixinMethods,
        })
      }
      if (globalMixinMethods) {
        Object.assign(this, globalMixinMethods)
      }
    })
  }
}

/**
 * 简化 definePrompt 的类型定义
 */
export function definePrompt<M extends Mixin<any>[] = []>(
  configFactory: (ExtendPromptObject | ExtendPromptObject[])
    | ((ctx: ShellkitContext<M>) => (ExtendPromptObject | ExtendPromptObject[])),
) {
  return (ctx: ShellKit) => {
    const configs = Array.isArray(configFactory) ? configFactory : [configFactory]
    const config = configs.map(c => typeof c === 'function' ? c(ctx as any) : c)
    return config.flat()
  }
}

/**
 * 定义命令的工具函数
 */
export function defineCommand<M extends Mixin<any>[] = []>(
  config: Command | ((ctx: ShellkitContext<M>) => Command),
) {
  return (ctx: ShellKit) => {
    const commandConfig = typeof config === 'function' ? config(ctx as any) : config
    return commandConfig
  }
}

export function createShellKit<M extends readonly Mixin<any>[]>(config: ShellKitConfig<M>): ShellkitContext<M> {
  return new ShellKit(config) as ShellkitContext<M>
}

const shellKit = createShellKit({
  mixins: [FsMixin, CommandMixin, PromptMixin, PackageMixin, TemplateMixin],
})

shellKit.addCommand({
  description: '测试命令',
  name: 'test',
  callback: (ctx) => {
    console.log('test', ctx)
  },
})
