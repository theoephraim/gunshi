const commonArgs = {
  host: {
    type: 'string',
    description: 'Host name',
    default: 'localhost'
  },
  port: {
    type: 'number',
    description: 'Port number',
    default: 8080
  },
  log: {
    type: 'enum',
    description: 'Log level',
    choices: ['debug', 'info', 'warn', 'error'],
    default: 'info'
  },
  clearScreen: {
    type: 'boolean',
    description: 'Clear the screen before starting'
  }
}

function makePositionalArgs(argCount = 10_000) {
  const args = {}
  for (let i = 0; i < argCount; i++) {
    args[`arg${i}`] = {
      type: 'positional',
      description: `Positional argument ${i + 1}`
    }
  }
  return args
}

const dev = {
  name: 'dev',
  description: 'Start the development server',
  args: {
    ...commonArgs,
    ...makePositionalArgs()
  }
}

const preview = {
  name: 'preview',
  description: 'Preview the production build',
  args: {
    ...commonArgs,
    ...makePositionalArgs()
  }
}

const build = {
  name: 'build',
  description: 'Build the project for production',
  args: {
    outDir: {
      type: 'string',
      description: 'Output directory',
      default: 'dist'
    },
    assetsInlineLimit: {
      type: 'number',
      description: 'Assets inline limit in bytes',
      default: 4096
    },
    minify: {
      type: 'boolean',
      description: 'Minify the output',
      default: true
    },
    log: commonArgs.log,
    ...makePositionalArgs()
  }
}

const subCommands = new Map()
subCommands.set(dev.name, dev)
subCommands.set(build.name, build)
subCommands.set(preview.name, preview)

export default subCommands
