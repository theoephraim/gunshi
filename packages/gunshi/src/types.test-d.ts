import { expectTypeOf, test } from 'vitest'

import type { Args } from 'args-tokens'
import type { CommandContext, CommandRunner, GunshiParams, KeyOfArgs } from './types.ts'

test('KeyOfArgOptions', () => {
  const _args = {
    foo: {
      type: 'string'
    },
    bar: {
      type: 'boolean'
    },
    baz: {
      type: 'boolean',
      negatable: true
    }
  } satisfies Args
  expectTypeOf<KeyOfArgs<typeof _args>>().toEqualTypeOf<'foo' | 'bar' | 'baz' | 'no-baz'>()
})

type A = {
  foo: {
    type: 'string'
  }
}
type E = {
  ext1: {
    foo: number
  }
  ext2: {
    bar: string
  }
}

test('CommandContext', () => {
  // Args type argument
  type T1 = CommandContext<GunshiParams<{ args: A }>>
  expectTypeOf<T1['extensions']>().toEqualTypeOf<undefined>()
  // Args and Extend type argument
  type T2 = CommandContext<GunshiParams<{ args: A; extensions: E }>>
  expectTypeOf<T2['extensions']>().toEqualTypeOf<E>()
})

test('CommandRunner', () => {
  // Args type argument
  type C1 = Parameters<CommandRunner<GunshiParams<{ args: A }>>>[0]
  expectTypeOf<C1['extensions']>().toEqualTypeOf<undefined>()

  // Args and Extend type argument
  type C2 = Parameters<CommandRunner<GunshiParams<{ args: A; extensions: E }>>>[0]
  expectTypeOf<C2['extensions']>().toEqualTypeOf<E>()
})
