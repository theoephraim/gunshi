import { cli } from 'gunshi'
import bar from './commands/bar/lazy.js'
import foo from './commands/foo/lazy.js'

// Lazy & Async command loading with structured by `commands` directory

// Setup a Map of sub-commands using lazy command
const subCommands = new Map()
subCommands.set(foo.commandName, foo)
subCommands.set(bar.commandName, bar)

// Define entry point command
const main = {
  run: () => {
    console.log(
      'Lazy & Async command loading with structured example - Use --help to see commands.'
    )
  }
}

// Run the CLI with lazy-loaded commands
await cli(process.argv.slice(2), main, {
  name: 'modularization-lazy-async',
  version: '1.0.0',
  subCommands
})
