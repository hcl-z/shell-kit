import { resolve } from 'node:path'

import { beforeEach, describe, vi } from 'vitest'
import { ShellKit } from '../../src'
import type { ArgsDetail } from '../../src/utils/argsParse'
import { Prompt } from '../../src/mixin/prompt'

describe('prompt test', () => {
  let shellkit: ShellKit<Record<string, any>, ArgsDetail, (typeof Prompt)[]>
  vi.mock('execa', () => {
    return {
      execa: vi.fn(),
    }
  })
  beforeEach(() => {
    shellkit = new ShellKit({
      plugins: [Prompt],
    })
    shellkit.instance.setTemplatePath(resolve(__dirname, '../assets/templates'))
  })
})
