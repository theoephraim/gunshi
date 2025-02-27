import { vi } from 'vitest'

export function defineMockLog(utils: typeof import('../src/utils')) {
  const logs: unknown[] = []
  vi.spyOn(utils, 'log').mockImplementation((...args: unknown[]) => {
    logs.push(args)
  })

  return () => logs.join(`\n`)
}

export function hasPrototype(obj: unknown): boolean {
  return Object.getPrototypeOf(obj) !== null
}
