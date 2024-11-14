import { copy } from 'fs-extra'
import { BasePlugin } from '../core/base-plugin'

export class FileSystem extends BasePlugin {

  _to(from: string) {
    const self = this
    return {
      to(path: string) {
        copy(from, path)
      },
      toRoot(path = '') {
        const to = self.getRootPath(path)
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
