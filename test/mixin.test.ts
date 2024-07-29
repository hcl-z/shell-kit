import { beforeAll, describe, expect, it } from 'vitest'
import { ShellKit } from '../src'
import { FileSystem } from '../src/mixin/fs'
import { Npm } from '../src/utils/shell'
import { Package } from '../src/mixin/package'

const NShellKit = ShellKit.mixinClass(Package, FileSystem)

describe('shellkit mixin', () => {
  it('success mixin', () => {
    const shellkit = new NShellKit()
    expect(shellkit.getPackageManager()).toBe('npm')
    shellkit.setPkgManager('yarn')
    expect(shellkit.getPackageManager()).toBe('yarn')
  })

  it('should be able to ', () => {

  })
})
