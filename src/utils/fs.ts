import { readFile } from 'node:fs/promises'
import { parse } from 'yaml'

export async function readJSON(path: string) {
  try {
    const str = await readFile(path, 'utf8')
    return JSON.parse(str)
  }
  catch (error) {
    console.error(error)
  }
}

export async function readYaml(path: string) {
  try {
    const file = await readFile(path, 'utf8')
    return parse(file)
  }
  catch (error) {
    console.error(error)
  }
}
