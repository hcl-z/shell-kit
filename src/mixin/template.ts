import path from 'node:path'
import { readFile } from 'node:fs/promises'
import chalk from 'chalk'
import Handlebars from 'handlebars'
import type { CreateMixinOptions } from '../utils/mixin'
import { createMixin } from '../utils/mixin'
import { forceCopyFile, forceWriteFile, isDirectory, readDir } from '../utils'
import type { ShellKit } from '..'

type TemplateMixinOption = CreateMixinOptions<'template', object, {
  prefix: string
  suffix: string
  silent: boolean
}, object, {
  copyFromRoot: (path?: string) => ReturnType<typeof to>
  copyFromTemplate: (path?: string) => ReturnType<typeof to>
  copyFromDest: (path?: string) => ReturnType<typeof to>
}>
async function handleFile(from: string, to: string, ctx: ShellKit, config: any) {
  const fileName = path.basename(from)
  if (fileName.startsWith(config.prefix)) {
    return
  }
  if (fileName.endsWith(config.suffix)) {
    const content = await readFile(from, 'utf8')
    const template = Handlebars.compile(content)
    const compiled = template(ctx.store)
    await forceWriteFile(to, compiled)
    if (!config.silent) {
      console.log(`${chalk.green('Template:')} ${to}`)
    }
  }
  else {
    await forceCopyFile(from, to)
    if (!config.silent) {
      console.log(`${chalk.green('Template:')} ${to}`)
    }
  }
}

function to(from: string, ctx: ShellKit, config: any) {
  const _to = async (from: string, to: string) => {
    const isDir = isDirectory(from)
    if (isDir) {
      const fileList = await readDir(from)
      fileList.forEach(file => handleFile(path.join(from, file), path.join(to, file), ctx, config))
    }
    else {
      handleFile(from, path.resolve(to, path.basename(from)), ctx, config)
    }
  }
  return {
    to(path: string) {
      _to(from, path)
    },
    toRoot(path = '') {
      const to = ctx.getRootPath(path)
      _to(from, to)
    },
    toTemplate(path = '') {
      const to = ctx.getTemplatePath(path)
      _to(from, to)
    },
    toDest(path = '') {
      const to = ctx.getDestPath(path)
      _to(from, to)
    },
  }
}

export const TemplateMixin = createMixin<TemplateMixinOption>({
  key: 'template',
  config: {
    prefix: '@',
    suffix: '.tpl',
    silent: true,
  },
}).extendGlobalMethods(({ ctx, config }) => ({
  copyFromRoot(path = '') {
    const from = ctx.getRootPath(path)
    return to(from, ctx, config)
  },
  copyFromTemplate(path = '') {
    const from = ctx.getTemplatePath(path)
    return to(from, ctx, config)
  },
  copyFromDest(path = '') {
    const from = ctx.getDestPath(path)
    return to(from, ctx, config)
  },
}))
