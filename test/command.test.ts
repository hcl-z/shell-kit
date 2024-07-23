import { describe, expect, it } from 'vitest'
import type { ArgsDetail } from '../src/utils/argsParse'
import { Commander } from '../src/utils/argsParse'

const commandData: ArgsDetail = {
  command: {
    install: {
      argument: {
        key: 'package',
        desc: 'package name',
        required: true,
      },
      options: [
        { key: 'target', alias: 't', desc: 'target dir', required: true },
      ],
    },
    remove: {

    },
  },
  globalOptions: [
    {
      key: 'option',
      alias: 'o',
      desc: 'test option',
      type: 'boolean',
      default: false,
      required: false,
    },
  ],
}

const commander = new Commander()

describe('command parse test', () => {
  it('command parse', () => {
    process.argv = ['node', 'index.js', 'install', 'package', '--target', './dir']
    commander.add(commandData)
    commander.parse()
  })

  it('command parse Error', () => {
    process.argv = ['node', 'index.js', 'nonCommand']
    commander.add(commandData)
    expect(commander.parse.bind(commander)).toThrowError('command nonCommand not found')
  })
  it('argument parse Error', () => {
    process.argv = ['node', 'index.js', 'install']
    commander.add(commandData)
    expect(commander.parse.bind(commander)).toThrowError('command install requires an argument')
  })

  it('option parse Error', () => {
    process.argv = ['node', 'index.js', 'install', 'llll', '-o']
    commander.add(commandData)
    expect(commander.parse.bind(commander)).toThrowError('command option target requires an argument')
  })
})
