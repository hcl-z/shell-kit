import glob from 'fast-glob'
import { BasePlugin } from '..'
import { debugLog } from '../utils/log'

export class Template extends BasePlugin {
  _excludeGlob: string[] = []
  _includeGlob: string[] = []

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

  matchFiles() {
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

  copy({
    silent = true,
  }: {
    silent?: boolean
  }) {
    const fileLists = this.matchFiles();
    (fileLists || []).forEach((file) => {
      if (file.endsWith('.template')) {

      }
      const from = this.ctx.getTemplatePath(file)
      const to = this.ctx.getDestPath(file)


    })
  }
}
