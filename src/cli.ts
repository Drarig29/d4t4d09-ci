import fs from 'fs'

import {version} from '@d4t4d09-ci/core/dist/helpers/version'
import {Builtins, Cli} from 'clipanion'
import {CommandClass} from 'clipanion/lib/advanced/Command'
import createDebug from 'debug'

import {getDynamicLibs} from './dynamic-libs'

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
    ;(require(`${commandPath}/cli`) as CommandClass[]).forEach((cmd) => {
      cli.register(cmd)
      for (const path of cmd.paths ?? []) {
        loadedCommands.add(path[0])
      }
    })
  }
}

const dynamicLibs = getDynamicLibs()

const pluginRequire = (path: string): unknown => {
  if (dynamicLibs.has(path)) {
    return dynamicLibs.get(path)
  }

  return require(path)
}

if (command && !loadedCommands.has(command)) {
  try {
    cli.register(require(`@d4t4d09-ci/plugin-${command}/dist/cli`)[0])
    debug(`Plugin ${command} loaded from installed module`)
  } catch {
    // TODO: look into `plugins` folder, and `tmp` for already downloaded plugins
    debug(`Loading ${command} from local file`)
    const yarnPlugin = require(`../packages/plugin-${command}/bundles/@d4t4d09-ci/plugin-${command}.js`)

    // XXX: support async factories (in order to support ESM out-of-the-box)
    // See https://github.com/yarnpkg/berry/blob/bfa6489467e0e11ee87268e01e38e4f7e8d4d4b0/packages/yarnpkg-core/sources/Configuration.ts#L1271-L1300
    // About checksums: https://github.com/yarnpkg/berry/blob/bfa6489467e0e11ee87268e01e38e4f7e8d4d4b0/packages/yarnpkg-core/sources/Configuration.ts#L1345-L1351
    const plugin = yarnPlugin.factory(pluginRequire).default

    for (const cmd of plugin.commands ?? []) {
      cli.register(cmd)
      for (const path of cmd.paths) {
        loadedCommands.add(path[0])
      }
    }
  }
}

if (require.main === module) {
  void cli.runExit(process.argv.slice(2), {
    stderr: process.stderr,
    stdin: process.stdin,
    stdout: process.stdout,
  })
}

export {cli}
