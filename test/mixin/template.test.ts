import { resolve } from 'node:path'
import { ShellKit } from '../../src'
import { Template } from '../../src/mixin/template'

function initFn() {
  const NShell = ShellKit.mixinClass([Template])
  const shellkit = new NShell()
  shellkit.setTemplatePath(resolve(import.meta.dirname, '../assets/templates'))
  return shellkit
}

let shellkit = initFn()

describe(
  'template mixin test',
  () => {
    beforeEach(() => {
      shellkit = initFn()
    })

    it('no file filter config', () => {
      const files = shellkit.validate()
      expect(files?.length).toBe(2)
    })

    it('add excludeTemFile', () => {
      shellkit.excludeTemFile('**/node_modules/**')
      const files = shellkit.validate()
      expect(files?.length).toBe(1)
      expect(files?.[0]).toBe('index.ts')
    })

    it('add includeTemFile', () => {
      shellkit.includeTemFile('**/*.json')
      const files = shellkit.validate()
      expect(files?.length).toBe(1)
      expect(files?.[0]).toBe('node_modules/pkg.json')
    })
  },
)
