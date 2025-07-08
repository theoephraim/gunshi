/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { Completion, script } from '@bombsh/tab'
import { plugin } from '@gunshi/plugin'
import { resolveLazyCommand } from '@gunshi/shared'
import { pluginId } from './types.ts'

import type { Handler } from '@bombsh/tab'
import type {
  Args,
  Command,
  LazyCommand,
  PluginContext,
  PluginWithoutExtension
} from '@gunshi/plugin'
import type { CompletionCommandContext, CompletionOptions } from './types.ts'

export * from './types.ts'

const TERMINATOR = '--'

const NOOP_HANDLER: Handler = () => {
  return []
}

/**
 * completion plugin for gunshi
 */
export default function completion(
  options: CompletionOptions = {}
): PluginWithoutExtension<CompletionCommandContext> {
  const config = options.config || {}
  const completion = new Completion()

  return plugin({
    id: pluginId,
    name: 'completion',

    async setup(ctx) {
      /**
       * add command for completion script generation
       */

      const completeName = 'complete'
      ctx.addCommand(completeName, {
        name: completeName,
        // TODO(kazupon): support description localization
        description: 'Generate shell completion script',
        // args: {
        //   shell: {
        //     type: 'string',
        //     // @ts-ignore -- TOOD: `args-tokens` will be updated to support `shell` type
        //     required: false,
        //     // TODO(kazupon): support description localization
        //     description:
        //       'shell type to generate completion script (zsh, bash, fish, fig, powershell)',
        //   }
        // },
        run: async cmdCtx => {
          if (!cmdCtx.env.name) {
            throw new Error('cli name is not defined.')
          }

          let shell: string | undefined = cmdCtx._[1]
          if (shell === TERMINATOR) {
            shell = undefined
          }

          if (shell === undefined) {
            const extra = cmdCtx._.slice(cmdCtx._.indexOf(TERMINATOR) + 1)
            completion.parse(extra)
          } else {
            script(shell as Parameters<typeof script>[0], cmdCtx.env.name, quoteExec())
          }
        }
      })

      /**
       * disable header renderer
       */

      ctx.decorateHeaderRenderer(async (_baseRenderer, _cmdCtx) => '')

      /**
       * setup bombshell completion
       */

      const entry = [...ctx.subCommands].map(([_, cmd]) => cmd).find(cmd => cmd.entry)
      if (!entry) {
        throw new Error(
          'No entry command found. Please ensure that an entry command is defined in the plugin context.'
        )
      }

      // setup root level completion
      const isPositional = hasPositional(await resolveLazyCommand(entry as Command))
      const root = ''
      // TODO(kazupon): more tweaking for root completion
      completion.addCommand(
        root,
        entry.description || '',
        isPositional ? [false] : [],
        NOOP_HANDLER
      )

      const args = entry.args || (Object.create(null) as Args)
      for (const [name, schema] of Object.entries(args)) {
        if (schema.type === 'positional') {
          continue // skip positional arguments on subcommands
        }
        // TODO(kazupon): more tweaking for root option completion
        completion.addOption(
          root,
          `--${name}`,
          schema.description || '',
          NOOP_HANDLER,
          schema.short
        )
      }

      handleSubCommands(completion, ctx.subCommands, config.subCommands)
    },

    extension: async (_ctx, _cmd) => {}
  })
}

function detectRuntime(): 'bun' | 'deno' | 'node' | 'unknown' {
  // @ts-ignore -- NOTE: ignore, because `process` will detect ts compile error on `deno check`
  if (globalThis.process !== undefined && globalThis.process.release?.name === 'node') {
    return 'node'
  }
  // @ts-ignore -- NOTE: ignore, because development env is node.js
  if (globalThis.Deno !== undefined) {
    return 'deno'
  }
  // @ts-ignore -- NOTE: ignore, because development env is node.js
  if (globalThis.Bun !== undefined) {
    return 'bun'
  }
  return 'unknown'
}

function quoteIfNeeded(path: string): string {
  return path.includes(' ') ? `'${path}'` : path
}

function quoteExec(): string {
  const runtime = detectRuntime()
  switch (runtime) {
    case 'node': {
      // @ts-ignore -- NOTE: ignore, because `process` will detect ts compile error on `deno check`
      const execPath = globalThis.process.execPath
      // @ts-ignore -- NOTE: ignore, because `process` will detect ts compile error on `deno check`
      const processArgs = globalThis.process.argv.slice(1)
      const quotedExecPath = quoteIfNeeded(execPath)
      // eslint-disable-next-line unicorn/no-array-callback-reference
      const quotedProcessArgs = processArgs.map(quoteIfNeeded)
      // @ts-ignore -- NOTE: ignore, because `process` will detect ts compile error on `deno check`
      // eslint-disable-next-line unicorn/no-array-callback-reference
      const quotedProcessExecArgs = globalThis.process.execArgv.map(quoteIfNeeded)
      return `${quotedExecPath} ${quotedProcessExecArgs.join(' ')} ${quotedProcessArgs[0]}`
    }
    case 'deno': {
      throw new Error('deno not implemented yet, welcome contributions :)')
    }
    case 'bun': {
      throw new Error('deno not implemented yet, welcome contributions :)')
    }
    default: {
      throw new Error('Unsupported runtime for completion script generation.')
    }
  }
}

type CompletionConfig = NonNullable<CompletionOptions['config']>

async function handleSubCommands(
  completion: Completion,
  subCommands: PluginContext['subCommands'],
  configs: CompletionConfig['subCommands'] = {}
) {
  for (const [name, cmd] of subCommands) {
    if (cmd.internal || cmd.entry || name === 'complete') {
      continue // skip entry / internal command / completion command itself
    }
    const resolvedCmd = await resolveLazyCommand(cmd)
    if (!resolvedCmd.description) {
      throw new Error(
        `Command "${name}" does not have a description. Please ensure that all commands have a description defined.`
      )
    }
    const isPositional = hasPositional(resolvedCmd)
    // TODO(kazupon): more tweaking for subcommand completion
    const handler = configs[name] || NOOP_HANDLER
    const commandName = completion.addCommand(
      name,
      resolvedCmd.description,
      isPositional ? [false] : [],
      handler
    )

    const args = cmd.args || (Object.create(null) as Args)
    for (const [name, schema] of Object.entries(args)) {
      if (schema.type === 'positional') {
        continue // skip positional arguments on subcommands
      }
      // TODO(kazupon): more tweaking for subcommand option completion
      completion.addOption(
        commandName,
        `--${name}`,
        schema.description || '',
        NOOP_HANDLER,
        schema.short
      )
    }
  }
}

function hasPositional(cmd: Command | LazyCommand) {
  return cmd.args && Object.values(cmd.args).some(arg => arg.type === 'positional')
}
