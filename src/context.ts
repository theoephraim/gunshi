import DefaultResource from '../locales/en-US.json' with { type: 'json' }
import { COMMAND_I18N_RESOURCE_KEYS, COMMAND_OPTIONS_DEFAULT } from './constants.js'
import { create, deepFreeze, resolveLazyCommand } from './utils.js'

import type { ArgOptions, ArgOptionSchema, ArgValues } from 'args-tokens'
import type {
  Command,
  CommandBuiltinResourceKeys,
  CommandContext,
  CommandEnvironment,
  CommandOptions,
  CommandResource
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
  /**
   * tweak the options and values
   */

  const _options =
    options == null
      ? undefined
      : // eslint-disable-next-line unicorn/no-array-reduce
        Object.entries(options as ArgOptions).reduce((acc, [key, value]) => {
          acc[key] = Object.assign(create<ArgOptionSchema>(), value)
          return acc
        }, create<ArgOptions>())
  const _values = Object.assign(create<ArgValues<Options>>(), values)

  /**
   * normalize the usage
   */

  const usage = Object.assign(create<Options>(), command.usage)
  const { help, version } = DefaultResource as unknown as ArgOptions
  usage.options = Object.assign(create<Options>(), usage.options, { help, version })

  /**
   * setup the environment
   */

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
   * load the built-in locale resources
   */

  localeResources.set(DEFAULT_LOCALE, DefaultResource as Record<string, string>)
  if (DEFAULT_LOCALE !== locale.toString()) {
    try {
      builtInLoadedResources = (await import(`../locales/${locale.toString()}.json`, {
        with: { type: 'json' }
      })) as Record<string, string>
      localeResources.set(locale.toString(), builtInLoadedResources)
    } catch {} // eslint-disable-line no-empty
  }

  /**
   * define the translation function
   */

  function translation<T, Key = CommandBuiltinResourceKeys | T>(key: Key): string {
    if (COMMAND_I18N_RESOURCE_KEYS.includes(key as CommandBuiltinResourceKeys)) {
      const resource =
        localeResources.get(locale.toString()) || localeResources.get(DEFAULT_LOCALE)!
      return resource[key as CommandBuiltinResourceKeys] || (key as string)
    } else {
      const resource =
        commandResources.get(locale.toString()) || commandResources.get(DEFAULT_LOCALE)!
      return resource[key as string] || ''
    }
  }

  /**
   * load the sub commands
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

  /**
   * create the context
   */

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

  /**
   * load the command resources
   */

  const loadedOptionsResources = Object.entries(usage.options || create<Options>()).map(
    ([key, _]) => {
      const option = usage.options![key]
      return [key, option] as [string, string]
    }
  )
  // eslint-disable-next-line unicorn/no-array-reduce
  const defaultCommandResource = loadedOptionsResources.reduce((res, [key, value]) => {
    res[key] = value
    return res
  }, create<Record<string, string>>())
  defaultCommandResource.description = command.description || ''
  defaultCommandResource.examples = usage.examples || ''
  commandResources.set(DEFAULT_LOCALE, defaultCommandResource)

  const originalResource = await loadCommandResource(ctx, command)
  if (originalResource) {
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

async function loadCommandResource<Options extends ArgOptions>(
  ctx: CommandContext<Options>,
  command: Command<Options>
): Promise<CommandResource<Options> | undefined> {
  let resource: CommandResource<Options> | undefined
  try {
    resource = await command.resource?.(ctx)
  } catch {} // eslint-disable-line no-empty
  return resource
}
