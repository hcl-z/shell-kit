import { copy } from 'fs-extra'
import type { ShellKitCore } from '..'

export class FileSystem {
  constructor(public ctx: ShellKitCore) {
  }

  _to(from: string) {
    // eslint-disable-next-line ts/no-this-alias
    const self = this
    return {
      to(path: string) {
        copy(from, path)
      },
      toRoot(path = '') {
        const to = self.ctx.getRootPath(path)
        copy(from, to)
      },
      toTemplate(path = '') {
        const to = self.ctx.getTemplatePath(path)
        copy(from, to)
      },
      toDest(path = '') {
        const to = self.ctx.getDestPath(path)
        copy(from, to)
      },
    }
  }

  copy(path: string) {
    return this._to(path)
  }

  copyFromRoot(path = '') {
    const from = this.ctx.getRootPath(path)
    return this._to(from)
  }

  copyFromTemplate(path = '') {
    const from = this.ctx.getTemplatePath(path)
    return this._to(from)
  }

  copyFromDest(path = '') {
    const from = this.ctx.getDestPath(path)
    return this._to(from)
  }
}
