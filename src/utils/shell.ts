import process from 'node:process'
import { execa } from 'execa'
import { Log } from './log'

export async function openWithCode(path: string) {
  try {
    await execa`code ${path}`
  }
  catch (error) {
    if (process.env.debug) {
      Log.error(`open ${path} failed`, error)
    }
  }
}

export async function runScript() {

}

export async function install() {
  // npm

  // yarn

  // pnpm

  await execa`pnpm install`
}

export class Npm {
  pkgManager = 'pnpm'
  async install() {
    await execa`pnpm install`
  }
}
