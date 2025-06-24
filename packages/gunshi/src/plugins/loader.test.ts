import { expect, test } from 'vitest'
import { createMockCommandContext } from '../../test/utils.ts'
import { define, lazy } from '../definition.ts'
import loaderPlugin from './loader.ts'

import type { LoaderCommandContext } from './loader.ts'

test('loadCommand', async () => {
  const command1 = define({
    name: 'command1',
    run: () => 'command1 executed'
  })

  const lazyCommand2 = lazy(() => () => 'command2 executed', {
    name: 'lazyCommand2'
  })
  const subCommands = new Map()
  subCommands.set(command1.name, command1)
  subCommands.set(lazyCommand2.commandName, lazyCommand2)

  const plugged = loaderPlugin()
  const {
    extensions: { loader }
  } = await createMockCommandContext<{
    loader: LoaderCommandContext
  }>({
    subCommands,
    extensions: {
      loader: plugged.extension
    }
  })

  const loadedCommaneds = await loader.loadCommands()
  expect(loadedCommaneds).toHaveLength(2)
  expect(loadedCommaneds.map(cmd => cmd.name)).toEqual(['command1', 'lazyCommand2'])
})
