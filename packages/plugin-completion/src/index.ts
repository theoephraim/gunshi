/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { Completion, script } from '@bombsh/tab'
import {
  COMMAND_OPTIONS_DEFAULT,
  createCommandContext as _createCommandContext,
  plugin
} from '@gunshi/plugin'
import { localizable, namespacedId, resolveArgKey, resolveLazyCommand } from '@gunshi/shared'
import { pluginId } from './types.ts'

import type { Handler } from '@bombsh/tab'
import type {
  Args,
  Command,
  CommandContext,
  LazyCommand,
  PluginContext,
  PluginWithExtension
} from '@gunshi/plugin'
import type { I18nCommandContext } from '@gunshi/plugin-i18n'
import type { CompletionCommandContext, CompletionConfig, CompletionOptions } from './types.ts'

export * from './types.ts'

const TERMINATOR = '--'

const NOOP_HANDLER: Handler = () => {
  return []
}

const i18nPluginId = namespacedId('i18n')

/**
 * completion plugin for gunshi
 */
export default function completion(
  options: CompletionOptions = {}
): PluginWithExtension<CompletionCommandContext> {
  const config = options.config || {}
  const completion = new Completion()

  return plugin({
    id: pluginId,
    name: 'completion',

    dependencies: [{ id: i18nPluginId, optional: true }],

    async setup(ctx) {
      /**
       * add command for completion script generation
       */

      const completeName = 'complete'
      ctx.addCommand(completeName, {
        name: completeName,
        // TODO(kazupon): support description localization
        description: 'Generate shell completion script',
        run: async cmdCtx => {
          if (!cmdCtx.env.name) {
            throw new Error('your cli name is not defined.')
          }

          let shell: string | undefined = cmdCtx._[1]
          if (shell === TERMINATOR) {
            shell = undefined
          }

          if (shell === undefined) {
            const extra = cmdCtx._.slice(cmdCtx._.indexOf(TERMINATOR) + 1)
            await completion.parse(extra)
          } else {
            script(shell as Parameters<typeof script>[0], cmdCtx.env.name, quoteExec())
          }
        }
      })

      /**
       * disable header renderer
       */
      // TODO(kazupon): we might be change this to a more flexible way
      ctx.decorateHeaderRenderer(async (_baseRenderer, _cmdCtx) => '')
    },

    // TODO(kazupon): type inference with plugin function type parameter
    extension: (_ctx, _cmd): CompletionCommandContext => {
      return {} as CompletionCommandContext
    },

    /**
     * setup bombshell completion with `onExtension` hook
     */

    onExtension: async (ctx, cmd) => {
      // TODO(kazupon): type inference with plugin function type parameter, more improvements!
      const extensions = ctx.extensions as unknown as { [i18nPluginId]: I18nCommandContext }
      const i18n = extensions[i18nPluginId]
      const subCommands = ctx.env.subCommands as ReadonlyMap<string, Command | LazyCommand>

      const entry = [...subCommands].map(([_, cmd]) => cmd).find(cmd => cmd.entry)
      if (!entry) {
        throw new Error('entry command not found.')
      }

      const entryCtx = await createCommandContext(entry)
      const localizeDescription = localizable(
        entryCtx as unknown as CommandContext,
        cmd,
        i18n ? i18n.translate : undefined
      )

      // setup root level completion
      const isPositional = hasPositional(await resolveLazyCommand(entry as Command))
      const root = ''
      completion.addCommand(
        root,
        (await localizeDescription('description')) || entry.description || '',
        isPositional ? [false] : [],
        NOOP_HANDLER
      )

      const args = entry.args || (Object.create(null) as Args)
      for (const [key, schema] of Object.entries(args)) {
        if (schema.type === 'positional') {
          continue // skip positional arguments on subcommands
        }
        // TODO(kazupon): more tweaking for root option completion
        completion.addOption(
          root,
          `--${key}`,
          (await localizeDescription(resolveArgKey(key))) || schema.description || '',
          config.entry?.args?.[key]?.handler || NOOP_HANDLER,
          schema.short
        )
      }

      await handleSubCommands(completion, subCommands, config.subCommands, i18n)
    }
  })
}

async function createCommandContext(cmd: Command | LazyCommand): Promise<CommandContext> {
  return await _createCommandContext({
    args: cmd.args || (Object.create(null) as Args),
    values: Object.create(null),
    positionals: [],
    rest: [],
    argv: [],
    tokens: [],
    omitted: false,
    callMode: cmd.entry ? 'entry' : 'subCommand',
    command: cmd,
    extensions: Object.create(null),
    cliOptions: COMMAND_OPTIONS_DEFAULT
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
      throw new Error('Unsupported your javascript runtime for completion script generation.')
    }
  }
}

async function handleSubCommands(
  completion: Completion,
  subCommands: PluginContext['subCommands'],
  configs: Record<string, CompletionConfig> = {},
  i18n?: I18nCommandContext | undefined
) {
  for (const [name, cmd] of subCommands) {
    if (cmd.internal || cmd.entry || name === 'complete') {
      continue // skip entry / internal command / completion command itself
    }

    const resolvedCmd = await resolveLazyCommand(cmd)
    const ctx = await createCommandContext(resolvedCmd)
    const localizeDescription = localizable(ctx, resolvedCmd, i18n ? i18n.translate : undefined)

    const isPositional = hasPositional(resolvedCmd)
    // TODO(kazupon): more tweaking for subcommand completion
    const commandName = completion.addCommand(
      name,
      (await localizeDescription('description')) || resolvedCmd.description || '',
      isPositional ? [false] : [],
      configs?.[name]?.handler || NOOP_HANDLER
    )

    const args = resolvedCmd.args || (Object.create(null) as Args)
    for (const [key, schema] of Object.entries(args)) {
      if (schema.type === 'positional') {
        continue // skip positional arguments on subcommands
      }
      // TODO(kazupon): more tweaking for subcommand option completion
      completion.addOption(
        commandName,
        `--${key}`,
        (await localizeDescription(resolveArgKey(key))) || schema.description || '',
        configs[commandName]?.args?.[key]?.handler || NOOP_HANDLER,
        schema.short
      )
    }
  }
}

function hasPositional(cmd: Command | LazyCommand) {
  return cmd.args && Object.values(cmd.args).some(arg => arg.type === 'positional')
}
