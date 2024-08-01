import make from '../dist'
import { Package } from '../src/mixin/package'
import { Template } from '../src/mixin/template'
import { Prompt } from '../src/utils/prompt'

const res = make({
  plugins: [Prompt, Package, Template],
  async prompt(ctx) {
    await ctx.prompt([{
      type: 'confirm',
      key: 'confirm',
      message: '是否继续',
      default: true,
    },
    ])
  },
})

// res.run()
