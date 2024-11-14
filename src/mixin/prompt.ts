import { BasePlugin } from '../core/base-plugin'
import prompts from 'prompts'
import { ShellKit } from '..'

export interface ExtendPromptObject extends Partial<prompts.PromptObject<string>> {
  store?: boolean
  callback?: (ctx: ShellKit, prompt: ExtendPromptObject, answer: any, answers: any) => void
}

const formatPromptObject = (promptObject: ExtendPromptObject | ExtendPromptObject[], store: Record<string, any>) => {
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
  } else {
    format(promptObject)
  }
  return promptObject
}

export class Prompt extends BasePlugin {
  public promptAnswers: Record<string, any> = {}
  async prompt(promptObject: ExtendPromptObject | ExtendPromptObject[]) {
    const lastPromptStore = this?.ctx?.localStore?.get('prompt')
    const formatedPromptObject = formatPromptObject(promptObject, lastPromptStore)

    const onSubmit = (prompt: ExtendPromptObject, answer: any, answers: any) => {
      if (prompt.store && typeof prompt.name === 'string') {
        this.ctx.localStore?.set('prompt', {
          ...lastPromptStore,
          [prompt.name]: answer,
        })
      }
      this.promptAnswers = answers
      prompt.callback?.(this.ctx, prompt, answer, answers)
    }
    const response = await prompts(formatedPromptObject as prompts.PromptObject<string>[], { onSubmit })
    this.promptAnswers = response
    return response
  }
}
