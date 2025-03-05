import type { ArgOptions, ArgValues } from 'args-tokens'

/**
 * Define a promise type that can be await from T
 */
type Awaitable<T> = T | Promise<T>

/**
 * The command i18n built-in options keys
 * @experimental
 */
export type CommandBuiltinOptionsKeys = keyof (typeof import('./constants'))['COMMON_OPTIONS_USAGE']

/**
 * The command i18n built-in resource keys
 * @experimental
 */
export type CommandBuiltinResourceKeys =
  (typeof import('./constants'))['COMMAND_I18N_RESOURCE_KEYS'][number]

/**
 * The command i18n built-in keys
 * @description The command i18n built-in keys are used to {@link CommandContext.translation | translate} function
 * @experimental
 */
export type CommandBuiltinKeys =
  | CommandBuiltinOptionsKeys
  | CommandBuiltinResourceKeys
  | 'description'
  | 'examples'

/**
 * The command environment
 */
export interface CommandEnvironment<Options extends ArgOptions = ArgOptions> {
  /**
   * The current working directory
   * @see {@link CommandOptions.cwd}
   */
  cwd: string | undefined
  /**
   * The command name
   * @see {@link CommandOptions.name}
   */
  name: string | undefined
  /**
   * The command description
   * @see {@link CommandOptions.description}
   *
   */
  description: string | undefined
  /**
   * The command version
   * @see {@link CommandOptions.version}
   */
  version: string | undefined
  /**
   * The left margin of the command output
   * @default 2
   * @see {@link CommandOptions.leftMargin}
   */
  leftMargin: number
  /**
   * The middle margin of the command output
   * @default 10
   * @see {@link CommandOptions.middleMargin}
   */
  middleMargin: number
  /**
   * Whether to display the usage option type
   * @default false
   * @see {@link CommandOptions.usageOptionType}
   */
  usageOptionType: boolean
  /**
   * The sub commands
   * @see {@link CommandOptions.subCommands}
   */
  subCommands: Map<string, Command<Options> | LazyCommand<Options>> | undefined
  /**
   * Render function the command usage
   */
  renderUsage: ((ctx: CommandContext<Options>) => Promise<string>) | null | undefined
  /**
   * Render function the header section in the command usage
   */
  renderHeader: ((ctx: CommandContext<Options>) => Promise<string>) | null | undefined
  /**
   * Render function the validation errors
   */
  renderValidationErrors:
    | ((ctx: CommandContext<Options>, error: AggregateError) => Promise<string>)
    | null
    | undefined
}

/**
 * The command options
 */
export interface CommandOptions<Options extends ArgOptions> {
  /**
   * The current working directory
   * @description This is the current working directory path passed in the context of the run command. This is useful if you need your command about the current execution directory.
   */
  cwd?: string
  /**
   * The command name
   * @description Please specify the name of the command that was executed. If you would specify it, gunshi will be displayed in the usage.
   */
  name?: string
  /**
   * The command description
   * @description Please specify the description (summary) of the command that was executed. If you would specify it, gunshi will be displayed in the usage.
   *
   */
  description?: string
  /**
   * The command version
   * @description Please specify the version of the command that was executed. If you would specify it, gunshi will be displayed in the usage.
   */
  version?: string
  /**
   * The locale of the command
   * @description The locale of the command that was executed. If you would specify it, gunshi command usage will be localized.
   */
  locale?: string | Intl.Locale
  /**
   * The sub commands
   */
  subCommands?: Map<string, Command<Options> | LazyCommand<Options>>
  /**
   * The left margin of the command output
   */
  leftMargin?: number
  /**
   * The middle margin of the command output
   */
  middleMargin?: number
  /**
   * Whether to display the usage option type
   */
  usageOptionType?: boolean
  /**
   * Render function the command usage
   */
  renderUsage?: ((ctx: Readonly<CommandContext<Options>>) => Promise<string>) | null
  /**
   * Render function the header section in the command usage
   */
  renderHeader?: ((ctx: Readonly<CommandContext<Options>>) => Promise<string>) | null
  /**
   * Render function the validation errors
   */
  renderValidationErrors?:
    | ((ctx: Readonly<CommandContext<Options>>, error: AggregateError) => Promise<string>)
    | null
}

/**
 * The command context
 * @description The command context is the context of the command execution
 */
export interface CommandContext<Options extends ArgOptions, Values = ArgValues<Options>> {
  /**
   * The command name, that is the command that is executed
   * @description The command name is same {@link CommandEnvironment.name}
   */
  name: string | undefined
  /**
   * The command description, that is the description of the command that is executed
   * @description The command description is same {@link CommandEnvironment.description}
   */
  description: CommandUsageRender<Options> | undefined
  /**
   * The command locale, that is the locale of the command that is executed
   */
  locale: Intl.Locale
  /**
   * The command environment, that is the environment of the command that is executed
   * @description The command environment is same {@link CommandEnvironment}
   */
  env: CommandEnvironment<Options>
  /**
   * The command options, that is the options of the command that is executed
   * @description The command options is same {@link Command.options}
   */
  options: Options | undefined
  /**
   * The command values, that is the values of the command that is executed
   * @description Resolve values with `resolveArgs` from command arguments and {@link Command.options}
   */
  values: Values
  /**
   * The command positionals, that is the positionals of the command that is executed
   * @description Resolve positionals with `resolveArgs` from command arguments
   */
  positionals: string[]
  /**
   * Whether the currently executing command has been executed with the sub-command name omitted
   */
  omitted: boolean
  /**
   * The usage of the command
   * @description The usage of the command is same {@link Command.usage}, and more has `--help` and `--version` options
   */
  usage: CommandUsage<Options>
  /**
   * Load the sub-commands
   * @description The loaded commands are cached and returned when called again
   * @returns loaded commands
   */
  loadCommands: () => Promise<Command<Options>[]>
  /**
   * The translation function
   * @param key {CommandBuiltinKeys | T} - The key to be translated
   * @returns The translated string, if the key is not found, the key itself is returned
   * @experimental
   */
  translation: <T = CommandBuiltinKeys, Key = CommandBuiltinKeys | T>(key: Key) => string
}

/**
 * The command usage render
 * @description if the render function is async, it should return a promise
 */
export type CommandUsageRender<Options extends ArgOptions> =
  | ((ctx: Readonly<CommandContext<Options>>) => Promise<string>)
  | string

/**
 * The command usage
 */
interface CommandUsage<Options extends ArgOptions> {
  /**
   * The options usage
   */
  options?: {
    [Option in keyof Options]: CommandUsageRender<Options>
  }
  /**
   * The examples usage
   */
  examples?: CommandUsageRender<Options>
}

/**
 * The command interface
 */
export interface Command<Options extends ArgOptions> {
  /**
   * The command name
   * @description
   * The command name is used to find command line arguments to execute from sub commands, so it's recommended to specify.
   */
  name?: string
  /**
   * The command description
   * @description
   * The command description is used to describe the command in usage, so it's recommended to specify.
   */
  description?: CommandUsageRender<Options>
  /**
   * whether the command is default or not
   * @description if the command is default, it is executed when no sub-command is specified
   */
  default?: boolean
  /**
   * The command options
   */
  options?: Options
  /**
   * The command usage
   * @description
   * The command usage is used to describe the command in usage, so it's recommended to specify.
   */
  usage?: CommandUsage<Options>
  /**
   * The command runner, that's the command to be executed
   */
  run: CommandRunner<Options>
  /**
   * The command resource fetcher
   * @experimental
   */
  resource?: CommadResourceFetcher<Options>
}

/**
 * The command resource
 * @experimental
 */
export interface CommandResource<Options extends ArgOptions> {
  /**
   * The command description resource
   */
  description: string
  /**
   * The options usage resources
   */
  options: {
    [Option in keyof Options]: string
  }
  /**
   * The examples usage resources
   */
  examples: string
}

/**
 * The command resource fetcher
 * @experimental
 */
export type CommadResourceFetcher<Options extends ArgOptions> = (
  ctx: Readonly<CommandContext<Options>>
) => Promise<CommandResource<Options>>

/**
 * The command runner interface
 * @param ctx - The {@link CommandContext | command context}
 */
export type CommandRunner<Options extends ArgOptions> = (
  ctx: Readonly<CommandContext<Options>>
) => Awaitable<void>

/**
 * The lazy command interface
 * @description The lazy command that's not loaded until it is executed
 */
export type LazyCommand<Options extends ArgOptions> = () => Awaitable<Command<Options>>
