import fs from 'fs'

import {version} from '@drarig29/d4t4d09-ci-core/dist/helpers/version'
import {Builtins, Cli} from 'clipanion'
import {CommandClass} from 'clipanion/lib/advanced/Command'
import createDebug from 'debug'

const debug = createDebug('cli')

const [command] = process.argv.slice(2)

export const BETA_COMMANDS = ['dora', 'deployment']

const onError = (err: any) => {
  console.log(err)
  process.exitCode = 1
}

process.on('uncaughtException', onError)
process.on('unhandledRejection', onError)

const cli = new Cli({
  binaryLabel: 'Datadog CI',
  binaryName: 'datadog-ci',
  binaryVersion: version,
})

cli.register(Builtins.HelpCommand)
cli.register(Builtins.VersionCommand)

cli.register(require('@drarig29/d4t4d09-ci-plugin-synthetics/dist/cli')[0])
cli.register(require('@drarig29/d4t4d09-ci-plugin-synthetics/dist/cli')[1])

const loadedCommands: Set<string> = new Set()

const commandsPath = `${__dirname}/commands`
for (const commandFolder of fs.readdirSync(commandsPath)) {
  const betaCommandsEnabled =
    process.env.DD_BETA_COMMANDS_ENABLED === '1' || process.env.DD_BETA_COMMANDS_ENABLED === 'true'
  if (BETA_COMMANDS.includes(commandFolder) && !betaCommandsEnabled) {
    continue
  }
  const commandPath = `${commandsPath}/${commandFolder}`
  if (fs.statSync(commandPath).isDirectory()) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    ;(require(`${commandPath}/cli`) as CommandClass[]).forEach((cmd) => cli.register(cmd))
  }
}

if (command && !loadedCommands.has(command)) {
  debug(`Loading plugin ${command}`)
  cli.register(require(`@drarig29/d4t4d09-ci-plugin-${command}/dist/cli`)[0])
}

if (require.main === module) {
  void cli.runExit(process.argv.slice(2), {
    stderr: process.stderr,
    stdin: process.stdin,
    stdout: process.stdout,
  })
}

export {cli}
