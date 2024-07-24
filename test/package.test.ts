import type { MockInstance } from 'vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { execa } from 'execa'
import { Package } from '../src/utils/package'

describe('package', () => {
  describe('setPkgManager', () => {
    const packageInstance = new Package()
    const debugLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    it('should set the package manager', () => {
      const manager = 'yarn'
      packageInstance.setPkgManager(manager)
      expect(packageInstance.pkgManager).toBe(manager)
    })

    it('should log the package manager change', () => {
      const manager = 'pnpm'
      packageInstance.setPkgManager(manager)
      expect(debugLogSpy).toHaveBeenCalledWith('info', `set pkg manager to ${manager}`)
    })
  })

  describe('runScript', () => {
    const packageInstance = new Package()
    it('should run the script using the package manager', async () => {
      const script = 'test'
      const stdout = 'Script output'
      //   vi.mock('execa', () => ({
      //     default: vi.fn().mockResolvedValue({ stdout }),
      //   }))

      await packageInstance.runScript(script)

      expect(execa).toHaveBeenCalledWith(packageInstance.pkgManager, ['run', script])
      expect(console.log).toHaveBeenCalledWith(stdout)
    })

    it('should log the error if script execution fails', async () => {
      const script = 'test'
      const error = new Error('Script failed')
      //   vi.mock('execa', () => ({
      //     default: vi.fn().mockRejectedValue(error),
      //   }))

      await packageInstance.runScript(script)

      expect((execa as any).default).toHaveBeenCalledWith(packageInstance.pkgManager, ['run', script])
      expect(console.log).toHaveBeenCalledWith(error)
    })
  })
})
