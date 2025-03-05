import DefaultResource from '../locales/en-US.json' with { type: 'json' }
import { COMMAND_I18N_RESOURCE_KEYS, COMMAND_OPTIONS_DEFAULT } from './constants.js'
import { create, deepFreeze, resolveCommandUsageRender, resolveLazyCommand } from './utils.js'

import type { ArgOptions, ArgOptionSchema, ArgValues } from 'args-tokens'
import type {
  Command,
  CommandBuiltinResourceKeys,
  CommandContext,
  CommandEnvironment,
  CommandOptions
} from './types'

export const DEFAULT_LOCALE = 'en-US'

export async function createCommandContext<
  Options extends ArgOptions,
  Values = ArgValues<Options>
>({
  options,
  values,
  positionals,
  command,
  commandOptions,
  omitted = false
}: {
  options: Options | undefined
  values: Values
  positionals: string[]
  omitted: boolean
  command: Command<Options>
  commandOptions: CommandOptions<Options>
}): Promise<Readonly<CommandContext<Options, Values>>> {
  const _options =
    options == null
      ? undefined
      : // eslint-disable-next-line unicorn/no-array-reduce
        Object.entries(options as ArgOptions).reduce((acc, [key, value]) => {
          acc[key] = Object.assign(create<ArgOptionSchema>(), value)
          return acc
        }, create<ArgOptions>())
  const _values = Object.assign(create<ArgValues<Options>>(), values)
  const usage = Object.assign(create<Options>(), command.usage)
  const { help, version } = DefaultResource as unknown as ArgOptions
  usage.options = Object.assign(create<Options>(), usage.options, { help, version })
  const env = Object.assign(
    create<CommandEnvironment<Options>>(),
    COMMAND_OPTIONS_DEFAULT,
    commandOptions
  )

  const locale = resolveLocale(commandOptions.locale)
  const localeResources: Map<string, Record<string, string>> = new Map()
  const commandResources = new Map<string, Record<string, string>>()
  let builtInLoadedResources: Record<string, string> | undefined

  /**
   * Load the built-in locale resources
   */

  localeResources.set(DEFAULT_LOCALE, DefaultResource as Record<string, string>)
  if (DEFAULT_LOCALE !== locale.toString()) {
    builtInLoadedResources = (await import(`../locales/${locale.toString()}.json`, {
      with: { type: 'json' }
    })) as Record<string, string>
    localeResources.set(locale.toString(), builtInLoadedResources)
  }

  function translation<T, Key = CommandBuiltinResourceKeys | T>(key: Key): string {
    if (COMMAND_I18N_RESOURCE_KEYS.includes(key as CommandBuiltinResourceKeys)) {
      const resource =
        localeResources.get(locale.toString()) || localeResources.get(DEFAULT_LOCALE)!
      return resource[key as CommandBuiltinResourceKeys] || (key as string)
    } else {
      const resource =
        commandResources.get(locale.toString()) || commandResources.get(DEFAULT_LOCALE)!
      return resource[key as string] || (key as string)
    }
  }

  /**
   * Load the sub-commands
   */

  let cachedCommands: Command<Options>[] | undefined
  async function loadCommands(): Promise<Command<Options>[]> {
    if (cachedCommands) {
      return cachedCommands
    }

    const subCommands = [...(env.subCommands || [])] as [string, Command<Options>][]
    return (cachedCommands = await Promise.all(
      subCommands.map(async ([name, cmd]) => await resolveLazyCommand(cmd, name))
    ))
  }

  const ctx = deepFreeze(
    Object.assign(create<CommandContext<Options, Values>>(), {
      name: command.name,
      description: command.description,
      omitted,
      locale,
      env,
      options: _options,
      values: _values,
      positionals,
      usage,
      loadCommands,
      translation
    })
  )

  const loadedOptionsResources = await Promise.all(
    Object.entries(usage.options || create<Options>()).map(async ([key, _]) => {
      const option = await resolveCommandUsageRender(ctx, usage.options![key])
      return [key, option] as [string, string]
    })
  )
  // eslint-disable-next-line unicorn/no-array-reduce
  const defaultCommandResource = loadedOptionsResources.reduce((res, [key, value]) => {
    res[key] = value
    return res
  }, create<Record<string, string>>())
  defaultCommandResource.description = await resolveCommandUsageRender(
    ctx,
    command.description || ''
  )
  defaultCommandResource.examples = await resolveCommandUsageRender(ctx, usage.examples || '')
  commandResources.set(DEFAULT_LOCALE, defaultCommandResource)

  if (command.resource) {
    const originalResource = await command.resource(ctx)
    // eslint-disable-next-line unicorn/no-array-reduce
    const resource = Object.entries(originalResource.options).reduce(
      (res, [key, value]) => {
        res[key] = value
        return res
      },
      Object.assign(create<Record<string, string>>(), {
        description: originalResource.description,
        examples: originalResource.examples
      } as Record<string, string>)
    )
    if (builtInLoadedResources) {
      resource.help = builtInLoadedResources.help
      resource.version = builtInLoadedResources.version
    }
    commandResources.set(locale.toString(), resource)
  }

  return ctx
}

function resolveLocale(locale: string | Intl.Locale | undefined): Intl.Locale {
  return locale instanceof Intl.Locale
    ? locale
    : typeof locale === 'string'
      ? new Intl.Locale(locale)
      : new Intl.Locale(DEFAULT_LOCALE)
}
