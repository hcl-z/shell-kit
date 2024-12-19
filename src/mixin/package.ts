import { execa } from 'execa'
import { debugLog } from '../utils/log'
import { type CreateMixinOptions, createMixin } from '../utils/mixin'

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'deno' | 'bun'

type PackageMixinType = CreateMixinOptions<'package', {
  pkgManager: PackageManager
}, object, object, {
  setPkgManager: (manager: PackageManager) => void
  runScript: (script: string) => Promise<void>
  install: (pkg?: string) => void
}>

export const PackageMixin = createMixin<PackageMixinType>({
  key: 'package',
  options: {
    pkgManager: 'npm',
  },
}).extendGlobalMethods(({ getOption, setOption }) => ({
  setPkgManager(manager: PackageManager) {
    setOption('pkgManager', manager)
    debugLog('info', `set pkg manager to ${manager}`)
  },
  async runScript(script: string) {
    const pkgManager = getOption('pkgManager')
    debugLog('info', `run script ${script}...`)
    try {
      await execa(pkgManager, ['run', script], {
        stdout: 'inherit',
        stderr: 'inherit',
      })
    }
    catch (error) {
      debugLog('error', error)
    }
  },
  install(pkg?: string) {
    try {
      const pkgManager = getOption('pkgManager')
      if (pkgManager === 'yarn') {
        const option = pkg ? ['add', pkg] : []
        execa('yarn', option, {
          stdout: 'inherit',
        })
      }
      else {
        const option = pkg ? ['install', pkg] : ['install']
        execa(pkgManager, option, {
          stdout: 'inherit',
        })
      }
    }
    catch (error) {
      debugLog('error', error)
    }
  },
}))
