import { describe, it, expect } from 'vitest'
import { Command, CommandMixin } from '../../src/mixin/command'
import { ShellKit } from '../../src'
import { beforeEach } from 'vitest'
import { ArgsDetail } from '../../src/utils/argsParse'

describe('Command', () => {
    let shellkit: ShellKit<[typeof CommandMixin], any, ArgsDetail>
    beforeEach(() => {
        shellkit = new ShellKit({
            plugins: [CommandMixin],
        })
    })
    it('应该能够添加命令', () => {
        const commandMixin = new CommandMixin(shellkit.ctx)
        const builder = commandMixin.addCommand({
            id: 'test',
            name: 'test',
            description: '测试命令',
            callback: () => { }
        })

        expect(builder).toBeDefined()
        expect(builder.getCommand().name).toBe('test')
        expect(builder.getCommand().description).toBe('测试命令')
    })

    it('应该能够为命令添加参数', () => {
        const commandMixin = new CommandMixin(shellkit.ctx)
        const builder = commandMixin.addCommand({
            id: 'test',
            name: 'test',
            callback: () => { }
        })

        builder.addArgument({
            name: 'testArg',
            description: '测试参数',
            required: true
        })

        const command = builder.getCommand()
        expect(command.args).toHaveLength(1)
        expect(command.args![0].name).toBe('testArg')
        expect(command.args![0].required).toBe(true)
    })

    it('应该能够添加全局参数', () => {
        const commandMixin = new CommandMixin(shellkit.ctx)
        commandMixin.addArgument({
            name: 'global',
            description: '全局参数'
        })

        const cittyCommand = commandMixin.parse()
        expect(cittyCommand).toBeDefined()
    })

    it('应该能够添加多个全局参数', () => {
        const commandMixin = new CommandMixin(shellkit.ctx)
        commandMixin.addArgument([
            {
                name: 'global1',
                description: '全局参数1'
            },
            {
                name: 'global2',
                description: '全局参数2'
            }
        ])

        const cittyCommand = commandMixin.parse()
        expect(cittyCommand).toBeDefined()
    })
})
