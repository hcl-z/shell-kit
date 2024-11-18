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
import { Command, CommandMixin } from './mixin/command'
import { validateNpmName } from './utils/validate'
import npmName from 'npm-name'
import { getGitInfo } from './utils/fetch'
import { Template } from './mixin/template'
import { FsMixin } from './mixin/fs'

/**
 * 将联合类型转换为交叉类型的工具类型
 */
type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never


/**
 * 优化插件类型定义
 */
export type Plugin = {
  new(ctx: ShellKit): BasePlugin
} & (abstract new (ctx: ShellKit) => BasePlugin)

/**
 * 基础插件类
 */
export abstract class BasePlugin {
  constructor(protected ctx: ShellKit) { }
  [key: string]: any
}

/**
 * 优化插件实例类型
 */
type PluginInstance<T extends Plugin> =
  T extends new (ctx: ShellKit) => infer R ? R : never

/**
 * 合并插件类型
 */
type MergePlugins<T extends readonly Plugin[]> = UnionToIntersection<{
  [K in keyof T]: PluginInstance<T[K]>
}[number]>

/**
 * ShellKit 配置接口
 */
export interface ShellKitConfig {
  plugins?: Plugin[]
  store?: Record<string, any>
  command?: ArgsDetail
  templatePath?: string
  key?: string
}

/**
 * 完整的上下文类型（包含插件方法）
 */
export type ShellkitContext<P extends readonly Plugin[]> = ShellKit & MergePlugins<P>

// 定义默认插件和类型
const defaultPlugins = [Package, CommandMixin, FsMixin, Template] as const
type DefaultPluginsType = typeof defaultPlugins

/**
 * ShellKit 核心类 - 简化泛型
 */
export class ShellKit {
  /** 全局存储 */
  public store: Record<string, any>
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

  private constructor(private config: ShellKitConfig) {
    this.store = createStore(this.config.store || {})
    this.localStore = null
    this.command = new Commander()
    this.rootPath = process.cwd()
    this.destPath = process.cwd()
    this.templatePath = this.config.templatePath || './template'
    this.pkgJson = {}
    this.initStore()
  }

  /**
   * 创建 ShellKit 实例，返回混入了插件的完整类型
   */
  public static async create<P extends readonly Plugin[] = []>(
    config: ShellKitConfig = {}
  ): Promise<ShellkitContext<[...DefaultPluginsType, ...P]>> {
    const plugins = [...defaultPlugins, ...(config.plugins || [])] as [...DefaultPluginsType, ...P]
    const instance = new ShellKit(config)
    const mixedInstance = instance.mixin(plugins)
    await mixedInstance.asyncInit()
    return mixedInstance as ShellkitContext<[...DefaultPluginsType, ...P]>
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
  resolvePrompts(prompts: Array<(ctx: ShellKit) => any>) {
    return prompts.map(p => p(this as unknown as ShellKit)).flat()
  }

  /**
   * 动态混入插件 - 返回完整类型
   */
  private mixin<P extends readonly Plugin[]>(plugins: P): ShellkitContext<P> {
    const newPlugins = plugins.map(Plugin => new Plugin(this))
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
    return this as unknown as ShellkitContext<P>
  }
}

/**
 * 简化 definePrompt 的类型定义
 */
export function definePrompt<P extends Plugin[] = []>(
  configFactory: (ExtendPromptObject | ExtendPromptObject[])
    | ((ctx: ShellkitContext<[...DefaultPluginsType, ...P]>) => (ExtendPromptObject | ExtendPromptObject[]))
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
export function defineCommand<P extends Plugin[] = []>(
  config: Command | ((ctx: ShellkitContext<[...DefaultPluginsType, ...P]>) => Command)
) {
  return (ctx: ShellKit) => {
    const commandConfig = typeof config === 'function' ? config(ctx as any) : config
    return commandConfig
  }
}

const shellKit = await ShellKit.create({
  plugins: [Prompt]
})

defineCommand((ctx) => {
  return {
    id: 'test',
    name: 'test',
    description: 'test command',
    callback: () => {
      console.log('test')
    }
  }
})



