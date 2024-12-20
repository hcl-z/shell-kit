import { copy } from 'fs-extra'
import type { CreateMixinOptions } from '../utils/mixin'
import { createMixin } from '../utils/mixin'
import type { ShellKit } from '..'

// 定义 FsMixin 的类型
type FsMixinType = CreateMixinOptions<'fs', object, object, object, {
  copyFromRoot: (path?: string) => void
  copyFromTemplate: (path?: string) => void
  /**
   * @param path 文件路径
   */
  copyFromDest: (path?: string) => void
  test: (path?: string) => void
}>

function to(ctx: ShellKit<any>, from: string) {
  return {
    to(path: string) {
      copy(from, path)
    },
    toRoot(path = '') {
      const to = ctx.getRootPath(path)
      copy(from, to)
    },
    toTemplate(path = '') {
      const to = ctx.getTemplatePath(path)
      copy(from, to)
    },
    toDest(path = '') {
      const to = ctx.getDestPath(path)
      copy(from, to)
    },
  }
}

export const FsMixin = createMixin<FsMixinType>({
  key: 'fs',
  options: {
    encoding: 'utf-8',
  },
  config: {
    basePath: '',
  },
}).extendGlobalMethods(({ ctx }) => {
  return {
    copy(path: string) {
      return to(ctx, path)
    },
    copyFromRoot(path = '') {
      const from = ctx.getRootPath(path)
      return to(ctx, from)
    },
    copyFromTemplate(path = '') {
      const from = ctx.getTemplatePath(path)
      return to(ctx, from)
    },
    copyFromDest(path = '') {
      const from = ctx.getDestPath(path)
      return to(ctx, from)
    },
    test(path = '') {
      console.log('test', path)
    },
  }
})
