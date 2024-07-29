import type { MockInstance } from 'vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { execa } from 'execa'
import { Package } from '../src/mixin/package'

describe('package Manager', () => {
  vi.mock('execa', () => {
    return {
      execa: vi.fn(),
    }
  })

  it('setPkgManager', () => {
    const pkg = new Package()
    expect(pkg.getPackageManager()).toBe('npm')
    pkg.setPkgManager('yarn')
    expect(pkg.getPackageManager()).toBe('yarn')
  })

  it('run script', () => {
    const pkg = new Package()
    pkg.runScript('script')
    expect(execa).toBeCalledWith('npm', ['run', 'script'])
    pkg.setPkgManager('yarn')
    pkg.runScript('script')
    expect(execa).toBeCalledWith('yarn', ['run', 'script'])
  })

  it('install', () => {
    const pkg = new Package()
    pkg.install()
    expect(execa).toBeCalledWith('npm', ['install'])
    pkg.setPkgManager('yarn')
    pkg.install()
    expect(execa).toBeCalledWith('yarn', [])
    pkg.install('pkg')
    expect(execa).toBeCalledWith('yarn', ['add', 'pkg'])
  })
})
