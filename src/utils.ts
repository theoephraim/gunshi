import type { ArgOptions } from 'args-tokens'
import type { Command, CommandContext, CommandUsageRender, LazyCommand } from './types'

export async function resolveCommandUsageRender<Options extends ArgOptions>(
  ctx: CommandContext<Options>,
  redner: CommandUsageRender<Options>
): Promise<string> {
  return typeof redner === 'function' ? await redner(ctx) : redner
}

export function getOptionsPairs<Options extends ArgOptions>(
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

export async function generateOptionsUsage<Options extends ArgOptions>(
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
    Object.entries(optionsPairs).map(async ([key, value]) => {
      const rawDesc = (await resolveCommandUsageRender(ctx, ctx.usage.options![key])) || ''
      const optionsSchema = ctx.env.usageOptionType ? `[${ctx.options![key].type}] ` : ''
      // padEnd is used to align the `[]` symbols
      const desc = `${optionsSchema ? optionsSchema.padEnd(optionSchemaMaxLength + 3) : ''}${rawDesc}`
      const option = `${value.padEnd(optionsMaxLength + ctx.env.middleMargin)}${desc}`
      return `${option.padStart(ctx.env.leftMargin + option.length)}`
    })
  )

  return usages.join('\n')
}

export async function resolveLazyCommand<Options extends ArgOptions>(
  cmd: Command<Options> | LazyCommand<Options>,
  name: string | undefined,
  entry: boolean = false
): Promise<Command<Options>> {
  const resolved = Object.assign(
    create<Command<Options>>(),
    typeof cmd == 'function' ? await cmd() : cmd,
    { default: entry }
  )

  if (resolved.name == null && name) {
    resolved.name = name
  }
  return deepFreeze(resolved)
}

export function create<T>(obj: object | null = null): T {
  return Object.create(obj) as T
}

export function log(...args: unknown[]): void {
  console.log(...args)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deepFreeze<T extends Record<string, any>>(obj: T): Readonly<T> {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  for (const key of Object.keys(obj)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const value = obj[key]
    if (typeof value === 'object' && value !== null) {
      deepFreeze(value)
    }
  }

  return Object.freeze(obj)
}
