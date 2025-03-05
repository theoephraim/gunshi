import type { ArgOptions } from 'args-tokens'
import type { CommandOptions } from './types'

export const COMMON_OPTIONS = {
  help: {
    type: 'boolean',
    short: 'h'
  },
  version: {
    type: 'boolean',
    short: 'v'
  }
} as const satisfies ArgOptions

export const COMMAND_OPTIONS_DEFAULT: CommandOptions<ArgOptions> = {
  name: undefined,
  description: undefined,
  version: undefined,
  cwd: undefined,
  subCommands: undefined,
  leftMargin: 2,
  middleMargin: 10,
  usageOptionType: false,
  renderHeader: undefined,
  renderUsage: undefined,
  renderValidationErrors: undefined
}

export const COMMAND_I18N_RESOURCE_KEYS = [
  'USAGE',
  'COMMAND',
  'SUBCOMMAND',
  'COMMANDS',
  'OPTIONS',
  'EXAMPLES',
  'FORMORE'
] as const
