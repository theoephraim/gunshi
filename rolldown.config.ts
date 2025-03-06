import path from 'node:path'
import { defineConfig } from 'rolldown'
import IsolatedDecl from 'unplugin-isolated-decl/rolldown'

const __dirname = import.meta.dirname

const config: ReturnType<typeof defineConfig> = defineConfig({
  input: path.resolve(__dirname, 'src/index.ts'),
  plugins: [IsolatedDecl()],
  output: {
    dir: path.resolve(__dirname, 'lib')
  }
})

export default config
