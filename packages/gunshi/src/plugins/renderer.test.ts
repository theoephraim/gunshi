import { expect, test } from 'vitest'
import { createMockCommandContext } from '../../test/utils.ts'
import { define, lazy } from '../definition.ts'
import i18nPlugin from './i18n.ts'
import rendererPlugin from './renderer.ts'

import type { DefaultRendererCommandContext } from './renderer.ts'

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

  const pluggedI18n = i18nPlugin()
  const pluggedRenderer = rendererPlugin()

  const {
    extensions: { renderer }
  } = await createMockCommandContext<{
    renderer: DefaultRendererCommandContext
  }>({
    subCommands,
    extensions: {
      i18n: pluggedI18n.extension,
      renderer: pluggedRenderer.extension
    }
  })

  const loadedCommaneds = await renderer.loadCommands()
  expect(loadedCommaneds).toHaveLength(2)
  expect(loadedCommaneds.map(cmd => cmd.name)).toEqual(['command1', 'lazyCommand2'])
})
