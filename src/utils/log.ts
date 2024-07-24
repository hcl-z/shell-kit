import process from 'node:process'
import chalk from 'chalk'

export const isDebug = process.env.debug

export const Log = {
  warn(...args: any[]) {
    console.log(chalk.bold.bgYellow(' WARN '), ...args)
  },
  info(...args: any[]) {
    console.log(chalk.bgBlue.bold(' INFO '), ...args)
  },
  error(...args: any[]) {
    console.log(chalk.bgRed.bold(' ERROR '), ...args)
  },
  debugError(...args: any[]) {
    if (process.env.debug) {
      console.log(chalk.bgRed.bold(' DEBUG ERROR '), ...args)
    }
  },
}

export function debugLog(type: 'warn' | 'info' | 'error', ...args: any[]) {
  if (process.env.debug) {
    Log[type](...args)
  }
}
