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

const SCRIPT = `pnpx tsx packages/plugin-completion/examples/demo.node.ts complete --`

test('no input', async () => {
  const output = await runCommand(`${SCRIPT}`)
  expect(output).toMatchSnapshot()
})

test('default command inputing', async () => {
  const output = await runCommand(`${SCRIPT} --`)
  expect(output).toMatchSnapshot()
})

test('default command long option', async () => {
  const output = await runCommand(`${SCRIPT} --config`)
  expect(output).toMatchSnapshot()
})

test('subcommand only', async () => {
  const output = await runCommand(`${SCRIPT} dev`)
  expect(output).toMatchSnapshot()
})

test('subcommand option inputing', async () => {
  const output = await runCommand(`${SCRIPT} dev --`)
  expect(output).toMatchSnapshot()
})

test('subcommand long option', async () => {
  const output = await runCommand(`${SCRIPT} dev --port`)
  expect(output).toMatchSnapshot()
})

test('subcommand short option', async () => {
  const output = await runCommand(`${SCRIPT} dev -H`)
  expect(output).toMatchSnapshot()
})

test('subcommand unknown option', async () => {
  const output = await runCommand(`${SCRIPT} dev --unknown`)
  expect(output).toMatchSnapshot()
})

test.todo('subcommand long option and value', async () => {
  const output = await runCommand(`${SCRIPT} dev --port=3`)
  expect(output).toMatchSnapshot()
})
