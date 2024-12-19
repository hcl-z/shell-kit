import prompts from 'prompts'
import type { ShellKit } from '..'
import type { CreateMixinOptions } from '../utils/mixin'
import { createMixin } from '../utils/mixin'

export interface ExtendPromptObject extends Partial<prompts.PromptObject<string>> {
  store?: boolean
  callback?: (ctx: ShellKit, prompt: ExtendPromptObject, answer: any, answers: any) => void
}

function formatPromptObject(promptObject: ExtendPromptObject | ExtendPromptObject[], store: Record<string, any>) {
  const format = (item: ExtendPromptObject) => {
    if (typeof item.name === 'string' && item.store && store?.[item.name] && !item.initial) {
      item.initial = store[item.name]
    }
    if (item.type === undefined) {
      item.type = 'text'
    }
    return item
  }
  if (Array.isArray(promptObject)) {
    for (const item of promptObject) {
      format(item)
    }
  }
  else {
    format(promptObject)
  }
  return promptObject
}

type PromptMixinOptions = CreateMixinOptions<'prompt', {
  store: Record<string, any>
  promptAnswers: Record<string, any>
}, {}, {}, {
  prompt: (promptObject: ExtendPromptObject | ExtendPromptObject[]) => Promise<Record<string, any>>
}>

export const PromptMixin = createMixin<PromptMixinOptions>({
  key: 'prompt',
  options: {
    store: {},
    promptAnswers: {},
  },
}).extendGlobalMethods(({ ctx, config, getOption, setOption }) => ({
  async prompt(promptObject: ExtendPromptObject | ExtendPromptObject[]) {
    const lastPromptStore = ctx?.localStore?.get('prompt')
    const formatedPromptObject = formatPromptObject(promptObject, lastPromptStore)

    const onSubmit = (prompt: ExtendPromptObject, answer: any, answers: any) => {
      if (prompt.store && typeof prompt.name === 'string') {
        ctx.localStore?.set('prompt', {
          ...lastPromptStore,
          [prompt.name]: answer,
        })
      }
      setOption('promptAnswers', answers)
      prompt.callback?.(ctx, prompt, answer, answers)
    }
    const response = await prompts(formatedPromptObject as prompts.PromptObject<string>[], { onSubmit })
    setOption('promptAnswers', response)
    return response
  },
}))
