import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import type { MockedFunction } from 'vitest'
import { execa } from 'execa'
import { getGitInfo, getLastestVersion, getPackageInfo } from '../src/utils/fetch'

describe('fetch test', () => {
  beforeAll(() => {
    vi.mock('execa', () => {
      return {
        execa: vi.fn()
          .mockResolvedValueOnce({ stdout: 'John Doe' })
          .mockResolvedValueOnce({ stdout: 'john.doe@example.com' })
          .mockImplementation(() => Promise.resolve({ stdout: '' })),
      }
    })
  })
  afterAll(() => {
    vi.resetAllMocks()
  })
  it('getGitInfo', async () => {
    const result = await getGitInfo(true)

    expect(execa).toHaveBeenNthCalledWith(1, 'git', ['config', '--get', '--global', 'user.name'])
    expect(execa).toHaveBeenNthCalledWith(2, 'git', ['config', '--get', '--global', 'user.email'])

    expect(result).toEqual({
      user: 'John Doe',
      email: 'john.doe@example.com',
    })
  })
  it('getPackageInfo', async () => {
    const info = await getPackageInfo('react')
    expect(Number(info.version?.split('.')?.[0])).toBeGreaterThanOrEqual(18)
  })

  it('getLastestVersion', async () => {
    const version = await getLastestVersion('react')
    expect(Number(version?.split('.')?.[0])).toBeGreaterThanOrEqual(18)
  })
})
