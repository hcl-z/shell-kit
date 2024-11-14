import process from 'node:process'
import { execa } from 'execa'
import pocate from 'pacote'
import { Log } from './log'

const DEFAULT_NPM_REGISTRY = 'https://registry.npmjs.org'

export async function getGitInfo(global = true) {
  const command = (key: string) => global ? ['config', '--get', '--global', key] : ['config', '--get', key]

  try {
    const [gitName, gitEmail] = await Promise.all([
      execa('git', command('user.name')),
      execa('git', command('user.email')),
    ])

    console.log(gitName, gitEmail);
    return {
      user: gitName.stdout,
      email: gitEmail.stdout,
    }
  }
  catch (error) {
    Log.debugError('get gitInfo error', error)
    return {
      user: '',
      email: '',
    }
  }
}

export async function getRegistry() {
  const { stdout } = await execa`npm config get registry`
  return stdout || DEFAULT_NPM_REGISTRY
}

export async function gitClone(url: string, cwd = '.') {
  try {
    await execa({ stdio: 'inherit', cwd })`git clone ${url}`
  }
  catch (error) {
    console.error('Error cloning repository:', error)
  }
}

export async function getPackageInfo(packageName: string) {
  const registry = await getRegistry()
  return await pocate.manifest(packageName, {
    registry,
    preferOnline: true,
  })
}

export async function getLastestVersion(packageName: string) {
  const packageInfo = await getPackageInfo(packageName)
  return packageInfo.version
}
