import { cli } from 'gunshi'

// Simple API example
// This demonstrates how to run a command with the Simple API
await cli(process.argv.slice(2), {
  run: async ctx => {
    console.log('Hello from simple example!')
    console.log('Passing from arguments as raw', ctx._)
  }
})
