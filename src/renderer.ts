import { create } from './utils.js'

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
    messages.push(ctx.description!, '')
  }

  // render usage section
  messages.push(...(await renderUsageSection(ctx)), '')

  // render commands section
  if (ctx.omitted && (await hasCommands(ctx))) {
    messages.push(...(await renderCommandsSection(ctx)), '')
  }

  // render options section
  if (hasOptions(ctx)) {
    messages.push(...(await renderOptionsSection(ctx)), '')
  }

  // render examples section
  if (hasExamples(ctx)) {
    messages.push(...renderExamplesSection(ctx), '')
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
  messages.push(`${ctx.translation('OPTIONS')}:`)
  const optionsPairs = getOptionsPairs(ctx)
  messages.push(await generateOptionsUsage(ctx, optionsPairs))
  return messages
}

function renderExamplesSection<Options extends ArgOptions>(
  ctx: Readonly<CommandContext<Options>>
): string[] {
  const messages: string[] = []
  const examples = ctx.usage
    .examples!.split('\n')
    .map(example => example.padStart(ctx.env.leftMargin + example.length))
  messages.push(`${ctx.translation('EXAMPLES')}:`, ...examples)
  return messages
}

async function renderUsageSection<Options extends ArgOptions>(
  ctx: Readonly<CommandContext<Options>>
): Promise<string[]> {
  const messages: string[] = [`${ctx.translation('USAGE')}:`]
  if (ctx.omitted) {
    const defaultCommand = `${resolveEntry(ctx)}${(await hasCommands(ctx)) ? ` [${resolveSubCommand(ctx)}]` : ''} ${hasOptions(ctx) ? `<${ctx.translation('OPTIONS')}>` : ''} `
    messages.push(defaultCommand.padStart(ctx.env.leftMargin + defaultCommand.length))
    if (await hasCommands(ctx)) {
      const commandsUsage = `${resolveEntry(ctx)} <${ctx.translation('COMMANDS')}>`
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
  const messages: string[] = [`${ctx.translation('COMMANDS')}:`]
  const loadedCommands = await ctx.loadCommands()
  const commandMaxLength = Math.max(...loadedCommands.map(cmd => (cmd.name || '').length))
  const commandsStr = await Promise.all(
    loadedCommands.map(cmd => {
      const key = cmd.name || ''
      const desc = cmd.description || ''
      const command = `${key.padEnd(commandMaxLength + ctx.env.middleMargin)}${desc} `
      return `${command.padStart(ctx.env.leftMargin + command.length)} `
    })
  )
  messages.push(...commandsStr, '', ctx.translation('FORMORE'))
  messages.push(
    ...loadedCommands.map(cmd => {
      const commandHelp = `${ctx.env.name} ${cmd.name} --help`
      return `${commandHelp.padStart(ctx.env.leftMargin + commandHelp.length)}`
    })
  )
  return messages
}

function resolveEntry<Options extends ArgOptions>(ctx: Readonly<CommandContext<Options>>): string {
  return ctx.env.name || ctx.translation('COMMAND')
}

function resolveSubCommand<Options extends ArgOptions>(
  ctx: Readonly<CommandContext<Options>>
): string {
  return ctx.name || ctx.translation('SUBCOMMAND')
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
  return hasOptions(ctx)
    ? hasAllDefaultOptions(ctx)
      ? `[${ctx.translation('OPTIONS')}]`
      : `<${ctx.translation('OPTIONS')}>`
    : ''
}

function getOptionsPairs<Options extends ArgOptions>(
  ctx: CommandContext<Options>
): Record<string, string> {
  // eslint-disable-next-line unicorn/no-array-reduce
  return Object.entries(ctx.options!).reduce((acc, [name, value]) => {
    let key = `--${name}`
    if (value.short) {
      key = `-${value.short}, ${key}`
    }
    if (value.type !== 'boolean') {
      key = value.default ? `${key} [${name}]` : `${key} <${name}>`
    }
    acc[name] = key
    return acc
  }, create<Record<string, string>>())
}

async function generateOptionsUsage<Options extends ArgOptions>(
  ctx: CommandContext<Options>,
  optionsPairs: Record<string, string>
): Promise<string> {
  const optionsMaxLength = Math.max(
    ...Object.entries(optionsPairs).map(([_, value]) => value.length)
  )

  const optionSchemaMaxLength = ctx.env.usageOptionType
    ? Math.max(...Object.entries(optionsPairs).map(([key, _]) => ctx.options![key].type.length))
    : 0

  const usages = await Promise.all(
    Object.entries(optionsPairs).map(([key, value]) => {
      const rawDesc = ctx.translation(key)
      const optionsSchema = ctx.env.usageOptionType ? `[${ctx.options![key].type}] ` : ''
      // padEnd is used to align the `[]` symbols
      const desc = `${optionsSchema ? optionsSchema.padEnd(optionSchemaMaxLength + 3) : ''}${rawDesc}`
      const option = `${value.padEnd(optionsMaxLength + ctx.env.middleMargin)}${desc}`
      return `${option.padStart(ctx.env.leftMargin + option.length)}`
    })
  )

  return usages.join('\n')
}
