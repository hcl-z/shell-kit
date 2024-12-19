import glob from 'fast-glob'
import type { CreateMixinOptions } from '../utils/mixin'
import { createMixin } from '../utils/mixin'

type TemplateMixin = CreateMixinOptions<'template', {
  excludeGlob: string[]
  includeGlob: string[]
}, {
  prefix: string
  suffix: string
}, {}, {
  includeTplFile: (glob: string | string[]) => void
  excludeTplFile: (glob: string | string[]) => void
  copy: (params: {
    files?: string[]
    silent?: boolean
  }) => void
}>

export const TemplateMixin = createMixin<TemplateMixin>({
  key: 'template',
  options: {
    excludeGlob: [],
    includeGlob: [],
  },
  config: {
    prefix: '@',
    suffix: '.tpl',
  },
}).extend(({ setOption, getOption, ctx, config }) => ({
  excludeTplFile(glob: string | string[]) {
    const excludeGlob = getOption('excludeGlob')
    if (typeof glob === 'string') {
      setOption('excludeGlob', [...excludeGlob, glob])
    }
    else {
      setOption('excludeGlob', [...excludeGlob, ...glob])
    }
  },
  includeTplFile(glob: string | string[]) {
    const includeGlob = getOption('includeGlob')
    if (typeof glob === 'string') {
      setOption('includeGlob', [...includeGlob, glob])
    }
    else {
      setOption('includeGlob', [...includeGlob, ...glob])
    }
  },
  copy: ({ files = [], silent = true }: {
    files?: string[]
    silent?: boolean
  }) => {
    const templatePath = ctx.getTemplatePath()
    const includeGlob = getOption('includeGlob')
    const excludeGlob = getOption('excludeGlob')
    if (!templatePath) {
      return
    }
    if (files) {
      files.forEach((file) => {
        const from = ctx.getTemplatePath(file)
        const to = ctx.getDestPath(file)
      })
      return
    }
    const include = includeGlob.length === 0 ? ['**/*'] : includeGlob
    const tplFiles = glob.sync(include, {
      ignore: excludeGlob,
      cwd: templatePath,
    }) || []
    tplFiles.forEach((file) => {
      if (file.endsWith(config.suffix)) {

      }
    })
  },
}))
