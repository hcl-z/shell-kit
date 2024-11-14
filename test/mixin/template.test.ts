import { resolve } from 'node:path'

import type { MockInstance } from 'vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { execa } from 'execa'
import { Template } from '../../src/mixin/template'
import { ShellKit, ShellKitCore } from '../../src'
import { Package } from '../../src/mixin/package'
import type { ArgsDetail } from '../../src/utils/argsParse'

describe('template', () => {
  let shellkit: ShellKit<Record<string, any>, ArgsDetail, (typeof Template)[]>
  vi.mock('execa', () => {
    return {
      execa: vi.fn(),
    }
  })
  beforeEach(() => {
    shellkit = new ShellKit({
      plugins: [Template],
    })
    shellkit.instance.setTemplatePath(resolve(__dirname, '../assets/templates'))
  })

  it('no file filter config', () => {
    const files = shellkit.instance.matchFiles()
    console.log(files)
    expect(files?.length).toBe(2)
  })

  it('add excludeTemFile', () => {
    shellkit.instance.excludeTemFile('**/node_modules/**')
    const files = shellkit.instance.matchFiles()
    expect(files?.length).toBe(1)
    expect(files?.[0]).toBe('index.ts')
  })

  it('add includeTemFile', () => {
    shellkit.instance.includeTemFile('**/*.json')
    const files = shellkit.instance.matchFiles()
    expect(files?.length).toBe(1)
    expect(files?.[0]).toBe('node_modules/pkg.json')
  })
})
