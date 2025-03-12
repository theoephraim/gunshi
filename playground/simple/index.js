import { cli } from 'gunshi'

// Simple API example
// This demonstrates how to run a command with the Simple API
cli(process.argv.slice(2), () => {
  console.log('Hello from simple example!')
})
