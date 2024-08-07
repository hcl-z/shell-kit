import { confirm, multiselect, password, select, text } from '@clack/prompts'
import { transformOptions } from '../utils'
import type { ShellKitCore } from '..'

interface BasePrompt {
  key: string
  message: string
  store?: boolean
  enabled?: boolean
}

interface TextPrompt extends BasePrompt {
  type: 'text'
  default?: string
  placeholder?: string
  required?: boolean
  callback?: (value: string) => void
}

interface PasswordPrompt extends Omit<BasePrompt, 'store'> {
  type: 'password'
  mask?: string
  required?: boolean
  callback?: (value: string) => void
}

interface SelectPrompt extends BasePrompt {
  type: 'select'
  mulitiple?: boolean
  default?: string
  required?: boolean
  choices: ({
    label: string
    value: string
    description?: string
  } | string)[]
  callback?: (value: string | string[]) => void
}

interface ConfirmPrompt extends BasePrompt {
  type: 'confirm'
  active?: string
  inactive?: string
  default?: boolean
  callback?: (value: boolean) => void
}

  type PromptType = TextPrompt | PasswordPrompt | SelectPrompt | ConfirmPrompt

export class Prompt {
  constructor(public ctx: ShellKitCore) {
  }

  async prompt(promptList: PromptType[]) {
    const lastPromptStore = this?.ctx?.localStore?.get('prompt')

    for (const item of promptList) {
      let res
      if (item.enabled === false) {
        continue
      }
      const keyStoreValue = lastPromptStore?.[item.key]

      switch (item.type) {
        case 'text':
          res = await text({
            message: item.message,
            placeholder: keyStoreValue ?? item.default,
            defaultValue: keyStoreValue ?? item.default,
          })
          break
        case 'password':
          res = await password({
            message: item.message,
            mask: item.mask,
          })
          break
        case 'select':
          const fn = item.mulitiple ? multiselect : select
          res = await fn({
            message: item.message,
            options: transformOptions(item.choices),
            initialValue: keyStoreValue ?? item.default,
            required: item.required,
          })
          break
        case 'confirm':
          res = await confirm({
            message: item.message,
            active: item.active,
            inactive: item.inactive,
            initialValue: keyStoreValue ?? item.default,
          })
          this.ctx.store.prompt[item.key] = res
          item?.callback?.(res as boolean)
          break
      }

      if (typeof res === 'symbol') {
        return
      }
      if (item.store) {
        this.ctx.localStore?.set('prompt', {
          ...lastPromptStore,
          [item.key]: res,
        })
      }
    }
  }
}
