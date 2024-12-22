import { resolve } from 'node:path'
import process from 'node:process'
import Configstore from 'configstore'
import type { PackageJson } from '../types/package'
import { createStore } from './utils/store'
import { debugLog } from './utils/log'
import type { ArgsDetail } from './utils/argsParse'
import { Commander } from './utils/argsParse'
import type { Mixin, MixinMethodParams } from './utils/mixin'
import { findNearestPackageJson } from './utils'

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

interface ShellKitConfig<M extends readonly Mixin<any>[]> {
  mixins?: M
  store?: Record<string, any>
  command?: ArgsDetail
  templatePath?: string
  key?: string
}

type ShellkitContext<M extends readonly Mixin<any>[]> = ShellKit<M> & InferMixinMethods<M> & InferMixinGlobalMethods<M>

/**
 *  core class
 */
export class ShellKit<M extends readonly Mixin<any>[] = []> {
  public store: Record<string, any>
  public localStore: Configstore | null
  public command: Commander
  public rootPath: string
  public destPath: string
  public templatePath: string
  public pkgJson: PackageJson = {}

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
    this.rootPath = path
    debugLog('info', 'currentRootPath change to:', path)
  }

  public setDestPath(path: string): void {
    this.destPath = path
    debugLog('info', 'currentDestPath change to:', path)
  }

  public setTemplatePath(path: string): void {
    this.templatePath = path
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

export function createShellKit<M extends readonly Mixin<any>[]>(config: ShellKitConfig<M>): ShellkitContext<M> {
  return new ShellKit(config) as ShellkitContext<M>
}
