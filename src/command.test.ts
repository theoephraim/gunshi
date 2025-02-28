import { afterEach, describe, expect, test, vi } from 'vitest'
import { defineMockLog } from '../test/utils'
import { gunshi } from './command'

import type { ArgOptions } from 'args-tokens'
import type { Command, LazyCommand } from './types'

afterEach(() => {
  vi.resetAllMocks()
})

describe('execute command', () => {
  test('entry iniline function', async () => {
    const mockFn = vi.fn()
    await gunshi([], mockFn)
    expect(mockFn).toBeCalled()
  })

  test('entry command', async () => {
    const mockFn = vi.fn()
    await gunshi([], {
      run: mockFn
    })
    expect(mockFn).toBeCalled()
  })

  test('entry strictly command + sub commands', async () => {
    const mockShow = vi.fn()
    const mockCommand1 = vi.fn()
    const mockCommand2 = vi.fn()
    const show = {
      name: 'show',
      run: mockShow
    }
    const subCommands = new Map<string, Command<ArgOptions> | LazyCommand<ArgOptions>>()
    subCommands.set('command1', {
      name: 'command1',
      run: mockCommand1
    })
    subCommands.set('command2', {
      name: 'command2',
      run: mockCommand2
    })
    const options = {
      subCommands
    }

    await gunshi([''], show, options) // omit
    await gunshi(['show'], show, options)
    await gunshi(['command1'], show, options)
    await gunshi(['command2'], show, options)

    expect(mockShow).toBeCalledTimes(2)
    expect(mockCommand1).toBeCalledTimes(1)
    expect(mockCommand2).toBeCalledTimes(1)
  })

  test('entry loose command + sub commands', async () => {
    const mockAnonymous = vi.fn()
    const mockShow = vi.fn()
    const mockCommand1 = vi.fn()
    const mockCommand2 = vi.fn()
    // no name command
    const anonymous = {
      run: mockAnonymous
    }
    const subCommands = new Map<string, Command<ArgOptions> | LazyCommand<ArgOptions>>()
    subCommands.set('show', {
      run: mockShow
    })
    subCommands.set('command1', {
      name: 'command1',
      run: mockCommand1
    })
    subCommands.set('command2', {
      name: 'command2',
      run: mockCommand2
    })
    const options = {
      subCommands
    }

    await gunshi([''], anonymous, options) // omit
    await gunshi(['show'], anonymous, options)
    await gunshi(['command1'], anonymous, options)
    await gunshi(['command2'], anonymous, options)

    expect(mockAnonymous).toBeCalledTimes(1)
    expect(mockShow).toBeCalledTimes(1)
    expect(mockCommand1).toBeCalledTimes(1)
    expect(mockCommand2).toBeCalledTimes(1)
  })

  test('command not found', async () => {
    await expect(async () => {
      await gunshi(['show'], { run: vi.fn() }, {})
    }).rejects.toThrowError('Command not found: show')
  })
})

describe('aute generate usage', () => {
  test('inline function', async () => {
    const utils = await import('../src/utils')
    const log = defineMockLog(utils)
    await gunshi(['-h'], vi.fn())

    const message = log()
    expect(message).toMatchSnapshot()
  })

  test('loosely entry command', async () => {
    const utils = await import('../src/utils')
    const log = defineMockLog(utils)
    await gunshi(['-h'], {
      options: {
        foo: {
          type: 'string',
          short: 'f'
        }
      },
      run: vi.fn()
    })

    const message = log()
    expect(message).toMatchSnapshot()
  })

  test('strictly entry command', async () => {
    const utils = await import('../src/utils')
    const log = defineMockLog(utils)
    await gunshi(
      ['-h'],
      {
        options: {
          foo: {
            type: 'string',
            short: 'f'
          }
        },
        name: 'command1',
        usage: {
          options: {
            foo: 'The foo option'
          },
          examples: '# Example 1\n$ gunshi --foo bar\n# Example 2\n$ gunshi -f bar'
        },
        run: vi.fn()
      },
      {
        name: 'gunshi',
        description: 'Modern CLI tool',
        version: '0.0.0',
        usageOptionType: true
      }
    )

    const message = log()
    expect(message).toMatchSnapshot()
  })

  test('loosely sub commands', async () => {
    const utils = await import('../src/utils')
    const log = defineMockLog(utils)

    const entryOptions = {
      foo: {
        type: 'string',
        short: 'f'
      }
    } satisfies ArgOptions
    const entry = {
      options: entryOptions,
      run: vi.fn()
    } satisfies Command<typeof entryOptions>

    const command2Options = {
      bar: {
        type: 'number',
        short: 'b',
        default: 42
      }
    } satisfies ArgOptions
    const command2 = {
      options: command2Options,
      run: vi.fn()
    } satisfies Command<typeof command2Options>

    type CommandArgs = typeof entryOptions | typeof command2Options
    const subCommands = new Map<string, Command<CommandArgs> | LazyCommand<CommandArgs>>()
    subCommands.set('command2', command2)

    await gunshi(['-h'], entry, { subCommands })
    await gunshi(['command2', '-h'], entry, { subCommands })

    const message = log()
    expect(message).toMatchSnapshot()
  })

  test('strictly sub commands', async () => {
    const utils = await import('../src/utils')
    const log = defineMockLog(utils)

    const entryOptions = {
      foo: {
        type: 'string',
        short: 'f'
      }
    } satisfies ArgOptions
    const entry = {
      options: entryOptions,
      name: 'command1',
      usage: {
        options: {
          foo: 'The foo option'
        },
        examples: '# Example 1\n$ gunshi --foo bar\n# Example 2\n$ gunshi -f bar'
      },
      run: vi.fn()
    } satisfies Command<typeof entryOptions>

    const command2Options = {
      bar: {
        type: 'number',
        short: 'b',
        default: 42
      }
    } satisfies ArgOptions
    const command2 = {
      options: command2Options,
      name: 'command2',
      usage: {
        options: {
          bar: 'The bar option'
        },
        examples: '# Example 1\n$ gunshi command2 --bar 42\n# Example 2\n$ gunshi command2 -b 42'
      },
      run: vi.fn()
    } satisfies Command<typeof command2Options>

    type CommandArgs = typeof entryOptions | typeof command2Options
    const subCommands = new Map<string, Command<CommandArgs> | LazyCommand<CommandArgs>>()
    subCommands.set('command2', command2)

    await gunshi(['-h'], entry, {
      subCommands,
      name: 'gunshi',
      description: 'Modern CLI tool',
      version: '0.0.0',
      leftMargin: 4,
      middleMargin: 15
    })

    await gunshi(['command2', '-h'], entry, {
      subCommands,
      name: 'gunshi',
      description: 'Modern CLI tool',
      version: '0.0.0'
    })

    const message = log()
    expect(message).toMatchSnapshot()
  })
})

describe.todo('custom generate usage', () => {})
