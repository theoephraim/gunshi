import { cli } from 'gunshi'
import { z } from 'zod'

// Custom Type Example
// This demonstrates how to use custom argument types with user-defined parsing logic

// Define a Zod schema for JSON configuration
const configSchema = z.object({
  debug: z.boolean().default(false),
  port: z.number().int().min(1024).max(65535).default(3000),
  host: z.string().default('localhost')
})

const command = {
  name: 'custom-type-example',
  description: 'Example command with custom argument types',
  args: {
    // CSV parser example
    // Usage: --tags javascript,typescript,node.js
    tags: {
      type: 'custom',
      description: 'Comma-separated list of tags',
      parse: value => value.split(',').map(tag => tag.trim())
    },

    // JSON parser example with Zod validation
    // Usage: --config '{"debug":true,"port":8080,"host":"0.0.0.0"}'
    config: {
      type: 'custom',
      description: 'JSON configuration validated with Zod',
      parse: value => {
        // Validate with Zod schema
        return configSchema.parse(JSON.parse(value))
      }
    }
  },

  run: ctx => {
    const { tags, config } = ctx.values

    if (tags) {
      console.log('\nTags:')
      tags.forEach(tag => console.log(`  - ${tag}`))
    }

    if (config) {
      console.log('\nConfiguration:')
      console.log(`  debug: ${config.debug}`)
      console.log(`  port: ${config.port}`)
      console.log(`  host: ${config.host}`)
    }
  }
}

// Run the command
await cli(process.argv.slice(2), command, {
  name: 'custom-type-demo',
  version: '1.0.0',
  description: 'Demo of custom argument types in Gunshi'
})
