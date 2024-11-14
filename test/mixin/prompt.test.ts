import { resolve } from 'node:path'

import type { MockInstance } from 'vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { execa } from 'execa'
import type { Template } from '../../src/mixin/template'
import { ShellKit, ShellKitCore } from '../../src'
import { Package } from '../../src/mixin/package'
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
