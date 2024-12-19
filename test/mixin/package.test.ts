import { beforeEach, describe, expect, it, vi } from 'vitest'
import { execa } from 'execa'
import { Package } from '../../src/mixin/package'
import { ShellKit } from '../../src'
import type { ArgsDetail } from '../../src/utils/argsParse'

describe('package Manager', () => {
  let shellkit: ShellKit<Record<string, any>, ArgsDetail, (typeof Package)[]>
  vi.mock('execa', () => {
    return {
      execa: vi.fn(),
    }
  })
  beforeEach(() => {
    shellkit = new ShellKit({
      plugins: [Package],
    })
  })

  it('setPkgManager', () => {
    expect(shellkit.instance.getPackageManager()).toBe('npm')
    shellkit.instance.setPkgManager('yarn')
    expect(shellkit.instance.getPackageManager()).toBe('yarn')
  })

  it('run script', () => {
    shellkit.instance.runScript('script')
    expect(execa).toBeCalledWith('npm', ['run', 'script'])
    shellkit.instance.setPkgManager('yarn')
    shellkit.instance.runScript('script')
    expect(execa).toBeCalledWith('yarn', ['run', 'script'])
  })

  it('install', () => {
    shellkit.instance.install()
    expect(execa).toBeCalledWith('npm', ['install'])
    shellkit.instance.setPkgManager('yarn')
    shellkit.instance.install()
    expect(execa).toBeCalledWith('yarn', [])
    shellkit.instance.install('pkg')
    expect(execa).toBeCalledWith('yarn', ['add', 'pkg'])
  })
})
