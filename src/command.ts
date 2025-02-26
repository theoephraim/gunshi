import { parseArgs, resolveArgs } from 'args-tokens'
import { COMMAND_OPTIONS_DEFAULT, COMMON_OPTIONS } from './constants.js'
import { createCommandContext } from './context.js'
import {
  renderHeader,
  renderUsage,
  renderUsageDefault,
  renderValidationErrors
} from './renderer.js'
import { log, nullObject } from './utils.js'

import type { ArgOptions, ArgToken } from 'args-tokens'
import type {
  Command,
  CommandContext,
  CommandEnvironment,
  CommandOptions,
  CommandRunner,
  LazyCommand
} from './types'

/**
 * Run a command with given arguments and environment
 * @param args - command line arguments
 * @param env - a {@link CommandEnvironment | command environment}
 * @param opts - a {@link CommandOptions | command options}
 */
export async function gunshi<Options extends ArgOptions>(
  args: string[],
  envOrEntry: CommandEnvironment<Options> | CommandRunner<Options>,
  opts: CommandOptions<Options> = COMMAND_OPTIONS_DEFAULT
): Promise<void> {
  const tokens = parseArgs(args)

  const raw = getCommandRaw(tokens)
  const [name, command, env] = await resolveCommand(raw, envOrEntry)
  if (!command) {
    throw new Error(`Command not found: ${name || ''}`)
  }

  const options = resolveOptions(command.options)

  const { values, positionals, error } = resolveArgs(options, tokens)
  const ctx = createCommandContext(
    options,
    values,
    positionals,
    env,
    command,
    opts as Required<CommandOptions<Options>>
  )
  if (values.version) {
    showVersion(ctx)
    return
  }

  await showHeader(ctx)

  if (values.help) {
    if (raw) {
      await showUsage(ctx)
      return
    } else {
      // omitted command
      await showUsageDefault(ctx)
      return
    }
  }

  if (error) {
    await showValidationErrors(ctx, error)
    throw error
  }

  await command.run(ctx)
}

function resolveOptions<Options extends ArgOptions>(options?: Options): Options {
  return Object.assign(Object.create(null) as Options, options, COMMON_OPTIONS)
}

function getCommandRaw(tokens: ArgToken[]): string {
  const firstToken = tokens[0]
  return firstToken &&
    firstToken.kind === 'positional' &&
    firstToken.index === 0 &&
    firstToken.value
    ? firstToken.value
    : ''
}

async function showUsage<Options extends ArgOptions>(ctx: CommandContext<Options>): Promise<void> {
  if (ctx.commandOptions.renderUsage === null) {
    return
  }
  const render = ctx.commandOptions.renderUsage || renderUsage
  log(await render(ctx))
}

async function showUsageDefault<Options extends ArgOptions>(
  ctx: CommandContext<Options>
): Promise<void> {
  if (ctx.commandOptions.renderUsageDefault === null) {
    return
  }
  const render = ctx.commandOptions.renderUsageDefault || renderUsageDefault
  log(await render(ctx))
}

function showVersion<Options extends ArgOptions>(ctx: CommandContext<Options>): void {
  log(ctx.env.version)
}

async function showHeader<Options extends ArgOptions>(ctx: CommandContext<Options>): Promise<void> {
  if (ctx.commandOptions.renderHeader === null) {
    return
  }
  const header = await (ctx.commandOptions.renderHeader || renderHeader)(ctx)
  if (header) {
    log(header)
    log()
  }
}

async function showValidationErrors<Options extends ArgOptions>(
  ctx: CommandContext<Options>,
  error: AggregateError
): Promise<void> {
  if (ctx.commandOptions.renderValidationErrors === null) {
    return
  }
  const render = ctx.commandOptions.renderValidationErrors || renderValidationErrors
  log(await render(ctx, error))
}

async function resolveCommand<Options extends ArgOptions>(
  raw: string,
  envOrEntry: CommandEnvironment<Options> | CommandRunner<Options>
): Promise<[string | undefined, Command<Options> | undefined, CommandEnvironment<Options>]> {
  const omitted = !raw
  if (typeof envOrEntry === 'function') {
    const cmd = { run: envOrEntry } satisfies Command<Options>
    return [undefined, cmd, { entry: cmd }]
  } else {
    if (omitted) {
      let name: string | undefined
      if (envOrEntry.entry) {
        if (typeof envOrEntry.entry === 'string') {
          name = envOrEntry.entry
        } else if (typeof envOrEntry.entry === 'object') {
          return [envOrEntry.entry.name, envOrEntry.entry, envOrEntry]
        }
      }

      // eslint-disable-next-line unicorn/no-null
      if (envOrEntry.subCommands == null) {
        return [undefined, undefined, envOrEntry]
      }

      if (name) {
        // find sub command with entry command name
        return [raw, await loadCommand(raw, envOrEntry), envOrEntry]
      } else {
        // find command from such commands that has default flag
        const loaded = await Promise.all(
          Object.entries(envOrEntry.subCommands || nullObject()).map(
            async ([_, cmd]) => await resolveLazyCommand(cmd)
          )
        )
        const found = loaded.find(cmd => cmd.default)
        return found ? [found.name, found, envOrEntry] : [undefined, undefined, envOrEntry]
      }
    } else {
      // eslint-disable-next-line unicorn/no-null
      if (envOrEntry.subCommands == null) {
        return [raw, undefined, envOrEntry]
      }
      return [raw, await loadCommand(raw, envOrEntry), envOrEntry]
    }
  }
}

async function resolveLazyCommand<Options extends ArgOptions>(
  cmd: Command<Options> | LazyCommand<Options>
): Promise<Command<Options>> {
  return typeof cmd == 'function' ? await cmd() : cmd
}

async function loadCommand<Options extends ArgOptions>(
  name: string,
  env: CommandEnvironment<Options>
): Promise<Command<Options>> {
  const cmd = env.subCommands![name]
  return await resolveLazyCommand(cmd)
}
