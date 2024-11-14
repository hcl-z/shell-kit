import { resolve } from 'node:path'
import Configstore from 'configstore'
import type { PackageJson } from '../types/package'
import { capitalizeFirstLetter, findNearestPackageJson } from './utils'
import { createStore } from './utils/store'
import { debugLog } from './utils/log'
import type { ArgsDetail } from './utils/argsParse'
import { Commander } from './utils/argsParse'
import { ExtendPromptObject, Prompt } from './mixin/prompt'
import { Package } from './mixin/package'
import { CommandMixin } from './mixin/command'
import { BasePlugin } from './core/base-plugin'
import { validateNpmName } from './utils/validate'
import npmName from 'npm-name'
import { getGitInfo } from './utils/fetch'

/**
 * 将联合类型转换为交叉类型的工具类型
 */
type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never


/**
 * 插件类型定义
 */
export type Plugin = {
  new(ctx: ShellKit): BasePlugin
}

/**
 * 获取插件实例类型的工具类型
 */
type PluginInstance<T extends Plugin> = T extends new (ctx: any) => infer R ? R : never

/**
 * 合并多个插件的方法类型
 */
type MergePlugins<T extends readonly Plugin[]> = UnionToIntersection<{
  [K in keyof T]: PluginInstance<T[K]>
}[number]>

/**
 * ShellKit 配置接口
 */
export interface ShellKitConfig<
  P extends readonly Plugin[],
  S extends Record<string, any> = any,
  C extends ArgsDetail = ArgsDetail,
> {
  /** 插件列表 */
  plugins?: P
  /** 全局存储 */
  store?: S
  /** 命令配置 */
  command?: C
  /** 模板路径 */
  templatePath?: string
  /** 配置存储键名 */
  key?: string
}

/**
 * 完整的上下文类型（包含插件方法）
 */
export type FullContext<
  P extends readonly Plugin[],
  S extends Record<string, any> = any,
> = MergePlugins<P> & { store: S }

/**
 * ShellKit 核心类
 * 提供插件系统和基础功能
 */
export class ShellKit<
  P extends readonly Plugin[] = [],
  S extends Record<string, any> = any,
  C extends ArgsDetail = ArgsDetail,
> {
  /** 全局存储 */
  public store: any
  /** 本地配置存储 */
  public localStore: Configstore | null
  /** 命令行解析器 */
  public command: Commander
  /** 项目根路径 */
  public rootPath: string
  /** 本地信息 */
  public localInfo: {
    user: string
    email: string
  } = {
      user: '',
      email: '',
    }
  /** 目标输出路径 */
  destPath: string
  /** 模板文件路径 */
  templatePath: string
  /** package.json 内容 */
  pkgJson: PackageJson

  private constructor(private config: ShellKitConfig<P, S, C>) {
    this.store = createStore(this.config.store || {} as S)
    this.localStore = null
    this.command = new Commander()
    this.rootPath = process.cwd()
    this.destPath = process.cwd()
    this.templatePath = this.config.templatePath || './template'
    this.pkgJson = {}
    this.initStore()
  }

  public static async create<
    P extends readonly Plugin[] = [],
    S extends Record<string, any> = any,
    C extends ArgsDetail = ArgsDetail
  >(config: ShellKitConfig<P, S, C>): Promise<ShellKit<P, S, C>> {
    const instance = new ShellKit(config)
    await instance.asyncInit()
    return instance
  }

  private async asyncInit() {
    this.localInfo = await getGitInfo()
  }


  /**
   * 获取根路径
   */
  getRootPath(path = '') {
    return resolve(this.rootPath, path)
  }

  /**
   * 获取目标路径
   */
  getDestPath(path = '') {
    return resolve(this.destPath, path)
  }

  /**
   * 获取模板路径
   */
  getTemplatePath(path = '') {
    return resolve(this.templatePath, path)
  }

  /**
   * 设置根路径
   */
  setRootPath(path: string) {
    this.rootPath = path
    debugLog('info', 'currentRootPath change to:', path)
  }

  /**
   * 设置目标路径
   */
  setDestPath(path: string) {
    this.destPath = path
    debugLog('info', 'currentDestPath change to:', path)
  }

  /**
   * 设置模板路径
   */
  setTemplatePath(path: string) {
    this.templatePath = path
    debugLog('info', 'currentTemplatePath change to:', path)
  }

  /**
   * 初始化存储
   */
  private initStore() {
    const json = findNearestPackageJson()
    this.pkgJson = json

    if (this.config.key || json.name) {
      this.localStore = new Configstore(json.name)
    }
  }

  /**
   * 解析 prompt 配置
   */
  resolvePrompts(prompts: Array<(ctx: ShellKit<P, S, C>) => any>) {
    return prompts.map(p => p(this as unknown as ShellKit<P, S, C>)).flat()
  }

  /**
   * 动态混入插件
   * @param plugins 要混入的插件数组
   * @returns 混入插件后的实例，包含新插件的方法
   */
  mixin<NewP extends readonly Plugin[]>(
    plugins: NewP
  ): ShellKit<[...P, ...NewP], S, C> & MergePlugins<[...P, ...NewP]> {
    const newPlugins = plugins.map(Plugin => new Plugin(this as unknown as ShellKit<[], any, ArgsDetail>))
    const pluginMethods = newPlugins.reduce((acc, plugin) => {
      const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(plugin))
        .filter(name => name !== 'constructor')
        .reduce((_acc, name) => {
          if (name in acc || name in this) {
            console.warn(`警告: 方法 "${name}" 已经存在，将被覆盖`)
          }
          _acc[name] = plugin[name].bind(plugin)
          return _acc
        }, {} as Record<string, any>)
      return { ...acc, ...methods }
    }, {})

    Object.assign(this, pluginMethods)

    return this as ShellKit<[...P, ...NewP], S, C> & MergePlugins<[...P, ...NewP]>
  }
}

/**
 * 配置辅助函数
 * 用于创建类型安全的配置对象
 */
export function defineConfig<
  P extends readonly Plugin[],
  S extends Record<string, any> = any,
  C extends ArgsDetail = ArgsDetail,
>(config: ShellKitConfig<P, S, C>): ShellKitConfig<P, S, C> {
  return config
}





