
import type { ShellKit } from '../index'
import { ExtendPromptObject } from '../mixin/prompt'


export function definePrompt<T extends ExtendPromptObject>(
    configFactory: (T | T[]) | ((ctx: ShellKit) => (T | T[]))
) {
    return (ctx: ShellKit) => {
        const configs = Array.isArray(configFactory) ? configFactory : [configFactory]
        const config = configs.map(c => typeof c === 'function' ? c(ctx) : c)
        return config.flat()
    }
} 