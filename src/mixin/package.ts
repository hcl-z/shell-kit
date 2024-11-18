import { execa } from 'execa'
import { BasePlugin } from '..'
import { debugLog } from '../utils/log'

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'deno' | 'bun'


export class Package extends BasePlugin {
  pkgManager: PackageManager = 'npm'

  getPackageManager() {
    return this.pkgManager
  }

  setPkgManager(manager: PackageManager) {
    this.pkgManager = manager
    debugLog('info', `set pkg manager to ${manager}`)
  }

  async runScript(script: string) {
    debugLog('info', `run script ${script}...`)
    try {
      await execa(this.getPackageManager(), ['run', script], {
        stdout: 'inherit',
        stderr: 'inherit',
      })
    }
    catch (error) {
      debugLog('error', error)
    }
  }

  install(pkg?: string) {
    try {
      if (this.getPackageManager() === 'yarn') {
        const option = pkg ? ['add', pkg] : []
        execa('yarn', option, {
          stdout: 'inherit',
        })
      }
      else {
        const option = pkg ? ['install', pkg] : ['install']
        execa(this.getPackageManager(), option, {
          stdout: 'inherit',
        })
      }
    }
    catch (error) {
      debugLog('error', error)
    }
  }
}
