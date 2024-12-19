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
