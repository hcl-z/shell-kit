import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/mixin/index.ts', 'src/utils/index.ts'],
  format: ['esm', 'cjs'],
  treeshake: true,
  clean: true,
  dts: true,
  sourcemap: true,
})
