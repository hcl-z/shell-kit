import { createMixin, CreateMixinOptions } from "../utils/mixin";

type TestMixinOptions = CreateMixinOptions<'test', {
    name: string
}, {
    name: string
}, {
    getName: () => string
}>

export default createMixin<TestMixinOptions>({
    key: 'test',
    options: {
        name: 'test'
    },
    config: () => {
        return {
            name: 'test'
        }
    }
}).extend(() => {
    return {
        getName: () => 'name'
    }
})