import {
  comments,
  defineConfig,
  imports,
  javascript,
  jsonc,
  markdown,
  prettier,
  promise,
  regexp,
  typescript,
  unicorn,
  vitest,
  yaml
} from '@kazupon/eslint-config'
import { globalIgnores } from 'eslint/config'

const config: ReturnType<typeof defineConfig> = defineConfig(
  javascript(),
  imports({
    typescript: true,
    rules: {
      'import/extensions': ['error', 'always', { ignorePackages: true }]
    }
  }),
  comments(),
  promise(),
  regexp(),
  unicorn({
    rules: {
      'unicorn/no-array-push-push': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-null': 'off'
    }
  }),
  typescript({
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/ban-ts-comment': 'off'
    }
  }),
  jsonc({
    json: true,
    json5: true,
    jsonc: true
  }),
  yaml(),
  markdown(),
  vitest(),
  prettier(),
  {
    name: 'docs',
    files: ['**/*.md/*.ts', '**/*.md/*.js'],
    rules: {
      'import/no-unresolved': 'off',
      'unused-imports/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off'
    }
  },
  globalIgnores([
    '.vscode',
    '.github',
    'docs/.vitepress/cache',
    '**/*.md/*.ts', // TODO: tweak for typescript on markdown
    '**/dist/**',
    'lib',
    'tsconfig.json',
    'pnpm-lock.yaml',
    'eslint.config.ts',
    'playground/bun',
    'playground/deno'
  ])
)

export default config
