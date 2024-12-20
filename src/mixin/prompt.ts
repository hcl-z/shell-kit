import type { PromptType } from 'prompts'
import prompts from 'prompts'
import type { ShellKit } from '..'
import type { CreateMixinOptions } from '../utils/mixin'
import { createMixin } from '../utils/mixin'

export interface ExtendPromptObject extends Partial<prompts.PromptObject<string>> {
  store?: boolean
  when?: (lastAnswers: any, answers: any) => boolean
  callback?: (ctx: ShellKit, prompt: ExtendPromptObject, answer: any, answers: any) => void
}

function getType(item: ExtendPromptObject) {
  if (item.when === undefined) {
    return item.type ?? 'text' as PromptType
  }
  else {
    return (prev: any, answer: any, prompt: any) => {
      if (typeof item.when === 'function') {
        return item.when(prev, answer) ? (item.type ?? 'text') : null
      }
      else {
        if (typeof item.type === 'function') {
          return item.type(prev, answer, prompt)
        }
        else {
          return item.type ?? 'text'
        }
      }
    }
  }
}
function formatPromptObject(promptObject: ExtendPromptObject | ExtendPromptObject[], store: Record<string, any>) {
  const format = (item: ExtendPromptObject) => {
    if (typeof item.name === 'string' && item.store && store?.[item.name] && !item.initial) {
      item.initial = store[item.name]
    }
    item.type = getType(item) as typeof item.type
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
}, object, object, {
  prompt: (promptObject: ExtendPromptObject | ExtendPromptObject[]) => Promise<Record<string, any>>
}>

export const PromptMixin = createMixin<PromptMixinOptions>({
  key: 'prompt',
  options: {
    store: {},
    promptAnswers: {},
  },
}).extendGlobalMethods(({ ctx, setOption }) => ({
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
