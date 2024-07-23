import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { readJSON, readYaml } from '../src'

describe('fs', () => {
  it('readJSON', () => {
    readJSON(path.resolve(__dirname, './assets/test.json')).then((res) => {
      expect(res.application.version).toBe('1.0.0')
    })
  })
  it('readYaml', () => {
    readYaml(path.resolve(__dirname, './assets/test.yaml')).then((res) => {
      expect(res.application.version).toBe('1.0.0')
    })
  })
})
