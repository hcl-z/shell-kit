import { execa } from 'execa'

// Print command's output
console.log(stdout)
export function openWithCode(code: string) {
  const { stdout } = await execa`code`
}
