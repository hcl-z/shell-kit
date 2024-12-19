import { ShellKit } from '../dist/index.js'
import { CommandMixin, Package, Prompt } from '../dist/mixin/index.js'
import { validateNpmName } from '../dist/utils/index.js'
import prompts from './prompts/index.js'
// 使用示例
async function main() {
  const shell = await ShellKit.create({})
    .then(instance => instance.mixin([Prompt, Package, CommandMixin]))

  shell.addCommand({
    id: 'build',
    name: 'build',
    description: '构建项目',
    callback: (...rest) => {
      console.log('build', rest)
    },
  })

  shell.addCommand({
    id: 'serve',
    name: 'serve',
    description: '启动服务器',
    callback: (...rest) => {
      console.log('serve', rest)
    },
  })

  await shell.parse()

  console.log(shell.resolvePrompts(prompts))
  await shell.prompt([{
    name: 'name',
    type: 'text',
    message: '请输入项目名称',
    validate: validateNpmName(),
    callback: (value) => {
      console.log('name', value)
    },
  }, {
    name: 'description',
    message: 'Description',
    type: 'text',
    callback: (value) => {
      console.log('description', value)
    },
  }, {
    name: 'userName',
    message: 'Author\'s Name',
    initial: shell.localInfo.user,
    store: true,
    type: 'text',
  }, {
    name: 'repository',
    message: 'Repository',
    initial: (prev, store) => {
      return `https://github.com/${prev}/${store?.name}`
    },
  }, {
    name: 'keywords',
    message: 'keywords(split by space)',
    initial: '',
  }, {
    name: 'pkgManager',
    type: 'select',
    message: 'which Pkg Manager do you want to use?',
    initial: 1,
    choices: [{
      title: 'npm',
      value: 'npm',
    }, {
      title: 'yarn',
      value: 'yarn',
    }, {
      title: 'pnpm',
      value: 'pnpm',
    }],
    store: true,
  }, ...shell.resolvePrompts(prompts)])
}

main()
