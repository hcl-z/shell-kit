import { execa } from 'execa'
import { ShellKit, debugLog, logInfo } from '..'

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'deno' | 'bun'

const runScriptMap = {
  npm: 'npm run',
  yarn: 'yarn run',
  pnpm: 'pnpm run',
  deno: 'deno run',
  bun: 'bun run',
}

export class Package extends ShellKit {
  pkgManager: PackageManager = 'npm'

  setPkgManager(manager: PackageManager) {
    this.pkgManager = manager
    debugLog('info', `set pkg manager to ${manager}`)
  }

  runScript(script: string) {
    debugLog('info', `run script ${script}...`)
    try {
      const { stdout } = execa(this.pkgManager, ['run', script])
      console.log(stdout)
    }
    catch (error) {
      console.log(error)
    }
  }
}
