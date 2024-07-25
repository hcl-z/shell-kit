import { ShellKit } from '..'

export class FileSystem extends ShellKit {
  #to() {
    return {
      toRoot() {

      },
      toTemplate() {

      },
      toDest() {

      },
    }
  }

  copy() {
    return this.#to()
  }

  copyFromRoot() {
    return this.#to()
  }

  copyFromTemplate() {
    return this.#to()
  }

  copyFromDest() {
    return this.#to()
  }
}
