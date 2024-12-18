import { execa } from 'execa'
import { BasePlugin, ShellKit } from '..'
import { debugLog } from '../utils/log'

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'deno' | 'bun'


export function PackageMixin(ctx: ShellKit) {
  return {
    scope: 'package',
    pkgManager: 'npm',
    setPkgManager(manager: PackageManager) {
      this.pkgManager = manager
      debugLog('info', `set pkg manager to ${manager}`)
    },
    async runScript(script: string) {
      debugLog('info', `run script ${script}...`)
      try {
        await execa(this.pkgManager, ['run', script], {
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
        if (this.pkgManager === 'yarn') {
          const option = pkg ? ['add', pkg] : []
          execa('yarn', option, {
            stdout: 'inherit',
          })
        }
        else {
          const option = pkg ? ['install', pkg] : ['install']
          execa(this.pkgManager, option, {
            stdout: 'inherit',
          })
        }
      }
      catch (error) {
        debugLog('error', error)
      }
    }
  }
}