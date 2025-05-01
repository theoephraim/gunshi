import { lazy } from 'gunshi/definition'
import { meta } from './meta.js'

export default lazy(async () => {
  // Load with dynamically import the command runner from the module
  // You can cache the module if you want.
  const { runner } = await import('modularization-lazy-async/foo/runner')
  return runner
}, meta)
