import chalk from 'chalk'

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
}
