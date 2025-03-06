import type { KnipConfig } from 'knip'

export default {
  entry: ['src/index.ts', 'eslint.config.ts', 'rolldown.config.ts'],
  ignoreDependencies: ['lint-staged']
} satisfies KnipConfig
