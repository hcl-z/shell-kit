import { ShellKit } from "..";

type RequiredMixinOptions<T extends CreateMixinOptions> = Pick<T, 'key'>
type OptionalMixinOptions<T extends CreateMixinOptions> = Omit<T, 'key' | 'methods' | 'globalMethods'>

type MixinOptions<T extends CreateMixinOptions> = RequiredMixinOptions<T> & Partial<OptionalMixinOptions<T>>


interface MixinMethodParams<C extends Record<string, any>, O extends Record<string, any>> {
    ctx: ShellKit<any>
    config: C
    getOption: (key: string) => O
    setOption<K extends keyof O>(key: K, options: O[K]): void
}

export interface CreateMixinOptions<
    K extends string = any,
    O extends Record<string, any> = {},
    C extends Record<string, any> = {},
    F extends Record<string, any> = {},
    G extends Record<string, any> = {}
> {
    key: K
    options: O
    methods: F,
    config: C
    globalMethods: G
}

type MethodsBuilder<T extends CreateMixinOptions> = (params: MixinMethodParams<T['config'], T['options']>) => T['methods']

export type Mixin<T extends CreateMixinOptions = CreateMixinOptions> = MixinClass<T>

class MixinClass<T extends CreateMixinOptions> {
    key: T['key'] = null
    options: T['options'] = {}
    config: T['config'] = {}
    methodsBuilder: MethodsBuilder<T> = () => ({})
    globalMethodsBuilder: MethodsBuilder<T> = () => ({} as T['globalMethods'])
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
    extend(func: (params: MixinMethodParams<T['config'], T['options']>) => T['methods']) {
        this.methodsBuilder = func
        return this
    }
    extendGlobalMethods(func: MethodsBuilder<T>) {
        this.globalMethodsBuilder = func
        return this
    }
}
export function createMixin<T extends CreateMixinOptions = CreateMixinOptions>(mixin: MixinOptions<T>) {
    return new MixinClass(mixin) as unknown as Mixin<T>
}

type FsMixin = CreateMixinOptions<'fs', {
    path: string
}, {
    need: boolean
}, {
    readFile: (params: { path: string }) => void
}, {
    readFile: (params: { path: string }) => void
}>

const res = createMixin<FsMixin>({
    key: 'fs',
    options: {
        path: ''
    },
    config: {
        need: true
    }
}).extend(params => ({
    readFile: (params) => {
        console.log(params)
    }
})).extendGlobalMethods(params => ({
    readFile: (params) => {
        console.log(params)
    }
}))

