import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { readJSON } from './fs'

export function findNearestPackageJson(scriptPath: string = process.cwd()) {
  let currentDir = scriptPath
  while (currentDir !== path.parse(currentDir).root) {
    const packageJsonPath = path.join(currentDir, 'package.json')
    if (existsSync(packageJsonPath)) {
      return readJSON(packageJsonPath)
    }
    currentDir = path.dirname(currentDir)
  }
  throw new Error('No package.json found in the path hierarchy')
}

export function transformOptions(options: (string | {
  label: string
  value: string
  description?: string
})[]) {
  return options.map((option) => {
    if (typeof option === 'string') {
      return {
        label: option,
        value: option,
      }
    }
    else {
      return {
        label: option.label,
        value: option.value,
        hint: option.description,
      }
    }
  })
}

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
