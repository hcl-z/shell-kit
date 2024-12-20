import type { ShellKit } from '..'

type RequiredMixinOptions<T extends CreateMixinOptions> = Pick<T, 'key'>
type OptionalMixinOptions<T extends CreateMixinOptions> = Omit<T, 'key' | 'methods' | 'globalMethods'>

type MixinOptions<T extends CreateMixinOptions> = RequiredMixinOptions<T> & Partial<OptionalMixinOptions<T>>

export interface MixinMethodParams<C extends Record<string, any>, O extends Record<string, any>> {
  ctx: ShellKit<any>
  config: C
  getOption: <K extends keyof O>(key: K) => O[K]
  setOption: <K extends keyof O>(key: K, options: O[K]) => void
}

export interface CreateMixinOptions<
  K extends string = any,
  O extends Record<string, any> = object,
  C extends Record<string, any> = object,
  F extends Record<string, any> = object,
  G extends Record<string, any> = object,
> {
  key: K
  options: O
  methods: F
  config: C
  globalMethods: G
}

type MethodsBuilder<T extends CreateMixinOptions, K extends keyof T> = (params: MixinMethodParams<T['config'], T['options']>) => T[K]

export type Mixin<T extends CreateMixinOptions = CreateMixinOptions> = MixinClass<T>

class MixinClass<T extends CreateMixinOptions> {
  key: T['key'] = null
  options: T['options'] = {}
  config: T['config'] = {}
  methodsBuilder: MethodsBuilder<T, 'methods'> = () => ({})
  globalMethodsBuilder: MethodsBuilder<T, 'globalMethods'> = () => ({})
  constructor(mixin: MixinOptions<T>) {
    if (!mixin.key) {
      throw new Error('Mixin key is required')
    }
    this.key = mixin.key
    this.options = mixin.options || {}
    this.config = mixin.config || {}
  }

  configure(config: T['config']) {
    this.config = { ...this.config, ...config }
    return this
  }

  extend(func: MethodsBuilder<T, 'methods'>) {
    this.methodsBuilder = func
    return this
  }

  extendGlobalMethods(func: MethodsBuilder<T, 'globalMethods'>) {
    this.globalMethodsBuilder = func
    return this
  }
}
export function createMixin<T extends CreateMixinOptions>(mixin: MixinOptions<T>) {
  return new MixinClass<T>(mixin) as unknown as Mixin<T>
}
