/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { namespacedId, PLUGIN_PREFIX } from '@gunshi/shared'

import type { Handler } from '@bombsh/tab'
import type { GenerateNamespacedKey } from '@gunshi/shared'

/**
 * The unique identifier for the completion plugin.
 */
export const pluginId: GenerateNamespacedKey<'completion', typeof PLUGIN_PREFIX> =
  namespacedId('completion')

/**
 * Type representing the unique identifier for the completion plugin.
 */
export type PluginId = typeof pluginId

/**
 * Extended command context which provides utilities via completion plugin.
 * These utilities are available via `CommandContext.extensions['g:completion']`.
 */
export interface CompletionCommandContext {}

/**
 * Completion plugin options.
 */
export interface CompletionOptions {
  config?: {
    /**
     * The entry point handler.
     */
    entry?: Handler
    /**
     * The handlers for subcommands.
     */
    subCommands?: Record<string, Handler>
  }
}
