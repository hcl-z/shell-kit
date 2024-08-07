import { execa } from 'execa'
import type { ShellKitCore } from '..'
import { debugLog } from '../utils/log'

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'deno' | 'bun'

export class Package {
  pkgManager: PackageManager = 'npm'
  pkg: PackageManager = 'npm'

  constructor(public ctx: ShellKitCore) {

  }

  getPackageManager() {
    return this.pkgManager
  }

  setPkgManager(manager: PackageManager) {
    this.pkgManager = manager
    debugLog('info', `set pkg manager to ${manager}`)
  }

  runScript(script: string) {
    debugLog('info', `run script ${script}...`)
    try {
      execa(this.getPackageManager(), ['run', script])
    }
    catch (error) {
      debugLog('error', error)
    }
  }

  install(pkg?: string) {
    try {
      if (this.getPackageManager() === 'yarn') {
        const option = pkg ? ['add', pkg] : []
        execa('yarn', option)
      }
      else {
        const option = pkg ? ['install', pkg] : ['install']
        execa(this.getPackageManager(), option)
      }
    }
    catch (error) {
      debugLog('error', error)
    }
  }
}
