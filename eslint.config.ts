import {
  comments,
  defineConfig,
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

const config: ReturnType<typeof defineConfig> = defineConfig(
  javascript(),
  typescript({
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/ban-ts-comment': 'off'
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
      '@typescript-eslint/no-unused-vars': 'off'
    }
  },
  {
    name: 'ignores',
    ignores: [
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
    ]
  }
)

export default config
