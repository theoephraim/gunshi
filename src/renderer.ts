import { generateOptionsUsage, getOptionsPairs, resolveCommandUsageRender } from './utils.js'

import type { ArgOptions } from 'args-tokens'
import type { CommandContext } from './types'

export function renderHeader<Options extends ArgOptions>(
  ctx: Readonly<CommandContext<Options>>
): Promise<string> {
  const title = ctx.env.description || ctx.env.name || ''
  return Promise.resolve(
    title
      ? `${title} (${ctx.env.name || ''}${ctx.env.version ? ` v${ctx.env.version}` : ''})`
      : title
  )
}

export async function renderUsage<Options extends ArgOptions>(
  ctx: Readonly<CommandContext<Options>>
): Promise<string> {
  const messages: string[] = []

  // render description section (sub command executed only)
  if (!ctx.omitted && hasDescription(ctx)) {
    messages.push(await resolveCommandUsageRender(ctx, ctx.description!), '')
  }

  // render usage section
  messages.push(...(await renderUsageSection(ctx)), '')

  // render commands section
  if (await hasCommands(ctx)) {
    messages.push(...(await renderCommandsSection(ctx)), '')
  }

  // render options section
  if (hasOptions(ctx)) {
    messages.push(...(await renderOptionsSection(ctx)), '')
  }

  // render examples section
  if (hasExamples(ctx)) {
    messages.push(...(await renderExamplesSection(ctx)), '')
  }

  return messages.join('\n')
}

export function renderValidationErrors<Options extends ArgOptions>(
  _ctx: CommandContext<Options>,
  error: AggregateError
): Promise<string> {
  const messages = [] as string[]
  for (const err of error.errors as Error[]) {
    messages.push(err.message)
  }
  // messages.push('', `For more info, run \`${resolveEntry(ctx)} ${resolveSubCommand(ctx)} --help\``)
  return Promise.resolve(messages.join('\n'))
}

async function renderOptionsSection<Options extends ArgOptions>(
  ctx: Readonly<CommandContext<Options>>
): Promise<string[]> {
  const messages: string[] = []
  messages.push('OPTIONS:')
  const optionsPairs = getOptionsPairs(ctx)
  messages.push(await generateOptionsUsage(ctx, optionsPairs))
  return messages
}

async function renderExamplesSection<Options extends ArgOptions>(
  ctx: Readonly<CommandContext<Options>>
): Promise<string[]> {
  const messages: string[] = []
  const resolved = await resolveCommandUsageRender(ctx, ctx.usage.examples!)
  const examples = resolved
    .split('\n')
    .map(example => example.padStart(ctx.env.leftMargin + example.length))
  messages.push(`EXAMPLES:`, ...examples)
  return messages
}

async function renderUsageSection<Options extends ArgOptions>(
  ctx: Readonly<CommandContext<Options>>
): Promise<string[]> {
  const messages: string[] = ['USAGE:']
  if (ctx.omitted) {
    const defaultCommand = `${resolveEntry(ctx)}${(await hasCommands(ctx)) ? ` [${resolveSubCommand(ctx)}]` : ''} ${hasOptions(ctx) ? '<OPTIONS>' : ''} `
    messages.push(defaultCommand.padStart(ctx.env.leftMargin + defaultCommand.length))
    if (await hasCommands(ctx)) {
      const commandsUsage = `${resolveEntry(ctx)} <COMMANDS>`
      messages.push(commandsUsage.padStart(ctx.env.leftMargin + commandsUsage.length))
    }
  } else {
    const usageStr = `${resolveEntry(ctx)} ${resolveSubCommand(ctx)} ${generateOptionsSymbols(ctx)}`
    messages.push(usageStr.padStart(ctx.env.leftMargin + usageStr.length))
  }
  return messages
}

async function renderCommandsSection<Options extends ArgOptions>(
  ctx: Readonly<CommandContext<Options>>
): Promise<string[]> {
  const messages: string[] = ['COMMANDS:']
  const loadedCommands = await ctx.loadCommands()
  const commandMaxLength = Math.max(...loadedCommands.map(cmd => (cmd.name || '').length))
  const commandsStr = await Promise.all(
    loadedCommands.map(async cmd => {
      const key = cmd.name || ''
      const desc = await resolveCommandUsageRender(
        ctx as CommandContext<Options>,
        cmd.description || ''
      )
      const command = `${key.padEnd(commandMaxLength + ctx.env.middleMargin)}${desc} `
      return `${command.padStart(ctx.env.leftMargin + command.length)} `
    })
  )
  messages.push(...commandsStr, '', `For more info, run any command with the \`--help\` flag:`)
  messages.push(
    ...loadedCommands.map(cmd => {
      const commandHelp = `${ctx.env.name} ${cmd.name} --help`
      return `${commandHelp.padStart(ctx.env.leftMargin + commandHelp.length)}`
    })
  )
  return messages
}

function resolveEntry<Options extends ArgOptions>(ctx: Readonly<CommandContext<Options>>): string {
  return ctx.env.name || 'COMMAND'
}

function resolveSubCommand<Options extends ArgOptions>(
  ctx: Readonly<CommandContext<Options>>
): string {
  return ctx.name || 'SUBCOMMAND'
}

function hasDescription<Options extends ArgOptions>(ctx: CommandContext<Options>): boolean {
  return !!ctx.description
}

async function hasCommands<Options extends ArgOptions>(
  ctx: CommandContext<Options>
): Promise<boolean> {
  const loadedCommands = await ctx.loadCommands()
  return loadedCommands.length > 1
}

function hasOptions<Options extends ArgOptions>(ctx: CommandContext<Options>): boolean {
  return !!(ctx.options && Object.keys(ctx.options).length > 0)
}

function hasExamples<Options extends ArgOptions>(ctx: CommandContext<Options>): boolean {
  return !!ctx.usage.examples
}

function hasAllDefaultOptions<Options extends ArgOptions>(ctx: CommandContext<Options>): boolean {
  return !!(ctx.options && Object.values(ctx.options).every(opt => opt.default))
}

function generateOptionsSymbols<Options extends ArgOptions>(ctx: CommandContext<Options>): string {
  return hasOptions(ctx) ? (hasAllDefaultOptions(ctx) ? '[OPTIONS]' : '<OPTIONS>') : ''
}
