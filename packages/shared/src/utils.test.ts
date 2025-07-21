import { expect, test } from 'vitest'
import { resolveArgKey } from './utils.ts'

import type { Args } from 'gunshi'

const _args = {
  foo: {
    type: 'string',
    description: 'Foo argument description',
    short: 'f'
  },
  bar: {
    type: 'boolean',
    description: 'Bar argument description',
    negatable: true
  }
} satisfies Args

test('resolveArgKey', () => {
  expect(resolveArgKey('foo')).toBe('arg:foo')
  expect(resolveArgKey<typeof _args, 'bar'>('bar')).toBe('arg:bar')
})
