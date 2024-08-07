import glob from 'fast-glob'
import type { ShellKitCore } from '..'

export class Template {
  _excludeGlob: string[] = []
  _includeGlob: string[] = []

  constructor(public ctx: ShellKitCore) {
  }

  excludeTemFile(glob: string | string[]) {
    if (typeof glob === 'string') {
      this._excludeGlob.push(glob)
    }
    else {
      this._excludeGlob.push(...glob)
    }
  }

  includeTemFile(glob: string | string[]) {
    if (typeof glob === 'string') {
      this._includeGlob.push(glob)
    }
    else {
      this._includeGlob.push(...glob)
    }
  }

  validate() {
    const templatePath = this.ctx.getTemplatePath()

    if (!templatePath) {
      return
    }
    const include = this._includeGlob.length === 0 ? ['**/*'] : this._includeGlob
    const files = glob.sync(include, {
      ignore: this._excludeGlob,
      cwd: templatePath,

    })
    return files
  }
}
