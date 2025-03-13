import { cli } from '@kazupon/gunshi'

import type { ArgOptions, Command } from '@kazupon/gunshi'

if (import.meta.main) {
  const options = {
    name: {
      type: 'string',
      short: 'n'
    },
    type: {
      type: 'string',
      short: 't',
      default: 'default'
    }
  } satisfies ArgOptions

  const create = {
    name: 'create',
    description: 'Create a new resource',
    options,
    usage: {
      options: {
        name: 'Name of the resource to create',
        type: 'Type of resource to create (default: "default")'
      },
      examples: '# Create a resource\n$ deno run index.ts create --name my-resource --type special'
    },
    run: ctx => {
      console.log(`Creating ${ctx.values.type} resource: ${ctx.values.name}`)
    }
  } satisfies Command<typeof options>

  const subCommands = new Map<string, Command<ArgOptions>>()
  subCommands.set(create.name, create as unknown as Command<ArgOptions>)

  await cli(
    Deno.args,
    {
      name: 'main',
      options: {
        count: {
          type: 'number',
          short: 'c'
        }
      },
      run: ctx => {
        console.log(`Count: ${ctx.values.count}`)
      }
    },
    {
      name: 'deno-cli-app',
      version: '0.1.0',
      subCommands
    }
  )
}
