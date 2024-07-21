// import { Log, ShellKit, readJSON } from '../dist/index.mjs'
import argv from 'minimist'

const _argv = argv(process.argv.slice(2))
console.log(_argv)
// async function main() {
//   new ShellKit({
//     store: {
//       a: {
//         b: {
//           c: {},
//           d: [],
//         },
//       },
//     },
//     doCommand(argument, ctx) {
//       console.log(argument)
//     },
//     setup: async (ctx) => {
//       ctx.options([
//         { type: 'command', key: 'crrr', desc: 'command', options: [], argument: { key: 'a', desc: 'argument' } },
//         { type: 'option', key: 'alia', desc: 'option', alias: 'a', default: 'b' },
//       ])
//       // ctx.store['a.b.c'].gg = 'bound'
//       // ctx.store['a.b.d'].push('Next')
//       // // d.push(1)
//       // console.log(JSON.stringify(ctx.store))
//       // console.log(this)
//       ctx.prompt([
//         { type: 'text', message: 'text', placeholder: 'text', callback: (value) => {
//           Log.warn(value)
//           Log.info(value)
//           Log.error(value)
//         } },
//         { type: 'password', message: 'password', mask: '-' },
//         { type: 'select', message: 'select', choices: ['a', 'b', 'c'] },
//         { type: 'select', message: 'Mulitselect', mulitiple: true, choices: ['a', 'b', 'c'] },
//         { type: 'confirm', message: 'confirm', active: 'yes', inactive: 'no' },
//       ])
//     },
//     // prompt: (ctx) => {
//     //   console.log(ctx.store)
//     //   ctx.store['nihao.yy'] = 4
//     //   console.log(ctx.store['nihao.yy'])
//     //   ctx.prompt([
//     //     { type: 'text', message: 'text', placeholder: 'text' },
//     //     { type: 'password', message: 'password', mask: '-' },
//     //     { type: 'select', message: 'select', choices: ['a', 'b', 'c'] },
//     //     { type: 'select', message: 'Mulitselect', mulitiple: true, choices: ['a', 'b', 'c'] },
//     //     { type: 'confirm', message: 'confirm', active: 'yes', inactive: 'no' },
//     //   ])
//     // },
//   })
//   // l.options([
//   //   { type: 'command', key: 'crrr', desc: 'command', options: [], argument: { key: 'a', desc: 'argument' } },
//   //   { type: 'option', key: 'alia', desc: 'option', alias: 'a', default: 'b' },
//   // ])
// }

// main()
