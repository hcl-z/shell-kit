import { readFileSync } from 'node:fs'
import { parse } from 'yaml'

export function readJSON(path: string) {
  try {
    const str = readFileSync(path, 'utf8')
    return JSON.parse(str)
  }
  catch (error) {
    console.error(error)
  }
}

export function readYaml(path: string) {
  try {
    const file = readFileSync(path, 'utf8')
    return parse(file)
  }
  catch (error) {
    console.error(error)
  }
}
