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

const SCRIPT = `pnpx tsx packages/plugin-completion/examples/demo.node.ts complete`

test('termination', async () => {
  const output = await runCommand(`${SCRIPT} --`)
  expect(output).toMatchSnapshot()
})

test.todo('default command option', async () => {
  const output = await runCommand(`${SCRIPT} --config --`)
  expect(output).toMatchSnapshot()
})

test('subcommand only', async () => {
  const output = await runCommand(`${SCRIPT} -- dev`)
  expect(output).toMatchSnapshot()
})

test('subcommand with long option', async () => {
  const output = await runCommand(`${SCRIPT} -- dev --port`)
  expect(output).toMatchSnapshot()
})

test('subcommand with short option', async () => {
  const output = await runCommand(`${SCRIPT} -- dev -H`)
  expect(output).toMatchSnapshot()
})

test.todo('subcommand with long option and value', async () => {
  const output = await runCommand(`${SCRIPT} -- dev --port=3`)
  expect(output).toMatchSnapshot()
})
