/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { plugin } from '../plugin.ts'

/**
 * completion plugin for Gunshi.
 */
export default function completion(_options = {}) {
  return plugin({
    name: 'completion'
    // TODO(kazupon): Implement completion plugin logic
  })
}
