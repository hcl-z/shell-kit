import { copyFileSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
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

export async function readDir(dir: string) {
  const files: string[] = []

  async function scan(currentPath: string) {
    const entries = await readdirSync(currentPath, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name)

      if (entry.isDirectory()) {
        await scan(fullPath)
      }
      else {
        const relativePath = path.relative(dir, fullPath)
        files.push(relativePath)
      }
    }
  }

  await scan(dir)
  return files
}

export function forceWriteFile(filePath: string, data: string) {
  try {
    const dirPath = path.dirname(filePath)
    mkdirSync(dirPath, { recursive: true })
    writeFileSync(filePath, data, 'utf8')
  }
  catch (error) {
    console.error('Error writing file:', error)
    throw error
  }
}

export function forceCopyFile(from: string, to: string) {
  try {
    const dirPath = path.dirname(to)
    mkdirSync(dirPath, { recursive: true })
    copyFileSync(from, to)
  }
  catch (error) {
    console.error('Error copy file:', error)
    throw error
  }
}

export function isDirectory(path: string) {
  return statSync(path).isDirectory()
}
