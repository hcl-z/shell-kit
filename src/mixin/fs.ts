import { ShellKit } from '..'
import {copy} from 'fs-extra'
export class FileSystem extends ShellKit {
  #to(from:string) {
    const self=this
    return {
      to(path:string){
        copy(from,path)
      },
      toRoot(path='') {
        const to=self.getRootPath(path)
        copy(from,to)
      },
      toTemplate(path='') {
        const to=self.getTemplatePath(path)
        copy(from,to)
      },
      toDest(path='') {
        const to=self.getDestPath(path)
        copy(from,to)
      },
    }
  }

  copy(path:string) {
    return this.#to(path)
  }

  copyFromRoot(path='') {
    const from=this.getRootPath(path)
    return this.#to(from)
  }

  copyFromTemplate(path='') {
    const from=this.getTemplatePath(path)
    return this.#to(from)
  }

  copyFromDest(path='') {
    const from =this.getDestPath(path)
    return this.#to(from)
  }

  
}
