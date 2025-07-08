import { exec } from 'node:child_process'
import { expect, test } from 'vitest'

function runCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(stderr)
      } else {
        resolve(stdout)
      }
    })
  })
}

test('shell option', async () => {
  const output = await runCommand(
    `pnpx tsx packages/plugin-completion/examples/demo.node.ts complete zsh`
  )
  expect(output).toMatchSnapshot()
})

test('termination only', async () => {
  const output = await runCommand(
    `pnpx tsx packages/plugin-completion/examples/demo.node.ts complete --`
  )
  expect(output).toMatchSnapshot()
})
