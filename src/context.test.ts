import { expect, test, vi } from 'vitest'
import { hasPrototype } from '../test/utils'
import { createCommandContext } from './context'

import type { ArgOptions } from 'args-tokens'
import type { Command, LazyCommand } from './types'

test('basic', () => {
  const command = {
    name: 'cmd1',
    description: 'this is cmd1',
    usage: {
      options: {
        foo: 'this is foo option',
        bar: 'this is bar option',
        baz: 'this is baz option'
      },
      examples: 'examples'
    },
    run: vi.fn()
  }
  const subCommands = new Map<string, Command<ArgOptions> | LazyCommand<ArgOptions>>()
  subCommands.set('cmd2', { name: 'cmd2', run: vi.fn() })

  const mockRenderUsage = vi.fn()
  const mockRenderValidationErrors = vi.fn()

  const ctx = createCommandContext({
    options: {
      foo: {
        type: 'string',
        short: 'f'
      },
      bar: {
        type: 'boolean'
      },
      baz: {
        type: 'number',
        short: 'b',
        default: 42
      }
    },
    values: { foo: 'foo', bar: true, baz: 42 },
    positionals: ['bar'],
    omitted: true,
    command,
    commandOptions: {
      cwd: '/path/to/cmd1',
      description: 'this is command line',
      version: '0.0.0',
      name: 'gunshi',
      leftMargin: 4,
      middleMargin: 2,
      usageOptionType: true,

      renderHeader: null,
      renderUsage: mockRenderUsage,
      renderValidationErrors: mockRenderValidationErrors,
      subCommands
    }
  })

  /**
   * check values
   */

  expect(ctx).toMatchObject({
    name: 'cmd1',
    description: 'this is cmd1',
    options: { foo: { type: 'string' } },
    values: { foo: 'foo' },
    positionals: ['bar'],
    omitted: true
  })
  expect(ctx.env).toMatchObject({
    name: 'gunshi',
    description: 'this is command line',
    version: '0.0.0',
    cwd: '/path/to/cmd1',
    leftMargin: 4,
    middleMargin: 2,
    usageOptionType: true,

    renderHeader: null,
    renderUsage: mockRenderUsage,
    renderValidationErrors: mockRenderValidationErrors
  })
  expect(ctx.usage).toMatchObject({
    options: {
      foo: 'this is foo option',
      bar: 'this is bar option',
      baz: 'this is baz option',
      help: 'Display this help message',
      version: 'Display this version'
    },
    examples: 'examples'
  })

  expect(ctx.env.subCommands).toEqual(subCommands) // TODO: use Map

  /**
   * check no prototype chains
   */

  expect(hasPrototype(ctx)).toEqual(false)
  expect(hasPrototype(ctx.env)).toEqual(false)
  expect(hasPrototype(ctx.options)).toEqual(false)
  for (const value of Object.values(ctx.options!)) {
    expect(hasPrototype(value)).toEqual(false)
  }
  expect(hasPrototype(ctx.values)).toEqual(false)

  /**
   * check frozen
   */

  expect(Object.isFrozen(ctx)).toEqual(true)
  expect(Object.isFrozen(ctx.env)).toEqual(true)
  expect(Object.isFrozen(ctx.env.subCommands)).toEqual(true)
  expect(Object.isFrozen(ctx.options)).toEqual(true)
  for (const value of Object.values(ctx.options!)) {
    expect(Object.isFrozen(value)).toEqual(true)
  }
  expect(Object.isFrozen(ctx.values)).toEqual(true)
})

test('default', () => {
  const command = {
    run: vi.fn()
  }
  const ctx = createCommandContext({
    options: undefined,
    values: { foo: 'foo', bar: true, baz: 42 },
    positionals: ['bar'],
    command,
    omitted: false,
    commandOptions: {}
  })

  /**
   * check values
   */

  expect(ctx).toMatchObject({
    name: undefined,
    description: undefined,
    options: undefined,
    values: { foo: 'foo', bar: true, baz: 42 },
    positionals: ['bar'],
    omitted: false
  })
  expect(ctx.env).toMatchObject({
    name: undefined,
    description: undefined,
    version: undefined,
    cwd: undefined,
    leftMargin: 2,
    middleMargin: 10,
    usageOptionType: false,
    renderHeader: undefined,
    renderUsage: undefined,
    renderValidationErrors: undefined
  })
  expect(ctx.usage).toMatchObject({
    options: {
      help: 'Display this help message',
      version: 'Display this version'
    }
  })
})
