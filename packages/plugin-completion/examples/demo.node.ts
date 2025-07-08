import { cli, define } from 'gunshi'
import completion from '../src/index.ts'

const entry = define({
  // name: 'root',
  args: {
    config: {
      type: 'string',
      description: 'Use specified config file',
      short: 'c'
    },
    mode: {
      type: 'string',
      description: 'Set env mode',
      short: 'm'
    },
    logLevel: {
      type: 'string',
      description: 'info | warn | error | silent',
      short: 'l'
    }
  },
  run: _ctx => {}
})

const dev = define({
  name: 'dev',
  description: 'Start dev server',
  args: {
    host: {
      type: 'string',
      description: 'Specify hostname',
      short: 'H'
    },
    port: {
      type: 'string',
      description: 'Specify port',
      short: 'p'
    }
  },
  run: () => {}
})

const build = define({
  name: 'build',
  description: 'Build project',
  run: () => {}
})

const lint = define({
  name: 'lint',
  description: 'Lint project',
  args: {
    files: {
      type: 'positional',
      description: 'Files to lint'
    }
  },
  run: () => {}
})

const subCommands = new Map<string, ReturnType<typeof define>>()
subCommands.set('dev', dev)
subCommands.set('build', build)
subCommands.set('lint', lint)

await cli(process.argv.slice(2), entry, {
  name: 'vite',
  version: '0.0.0',
  description: 'Vite CLI',
  subCommands,
  plugins: [completion()]
})
