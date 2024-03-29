import { program } from 'commander'
import projectConfig from '../package.json'
import chalk from 'chalk'
import leven from 'leven'
import createCommand from './commands/create-sol-project'
import createContractCommand from './commands/contract'
import createServerCommand from './commands/create-server'
import createTransferCommand from './commands/transfer'
import createAccountCommand from './commands/account'
import createGenerateCommand from './commands/generate-sol-sdk'
import { dappCommands } from './commands/dapps'
import { compileCommand } from './commands/compile'
import utils from './utils'

function main () {
  // show box
  utils.showBox('CPChain CLI: A scaffold for developing smart contracts on CPChain')

  // program
  program
    .version(`cpchain-cli ${projectConfig.version}`)
    .usage('<command> [options]')

  // Create main command
  createCommand(program)
  // Account management
  createAccountCommand(program)
  // Contract management
  createContractCommand(program)
  // Create server
  createServerCommand(program)
  // Transfer
  createTransferCommand(program)
  // Generate command
  createGenerateCommand(program)

  // Dapps command
  dappCommands.map(cmd => cmd(program))

  // Compile command
  compileCommand(program)

  // output help information on unknown commands
  program.on('command:*', ([cmd]) => {
    program.outputHelp()
    console.log('  ' + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`))
    console.log()
    suggestCommands(cmd)
    process.exitCode = 1
  })

  program.parse(process.argv)

  function suggestCommands (unknownCommand) {
    const availableCommands = program.commands.map(cmd => cmd.name())

    let suggestion

    availableCommands.forEach(cmd => {
      // 距离向量算法推测可能的命令
      const isBestMatch = leven(cmd, unknownCommand) < leven(suggestion || '', unknownCommand)
      if (leven(cmd, unknownCommand) < 3 && isBestMatch) {
        suggestion = cmd
      }
    })

    if (suggestion) {
      console.log('  ' + chalk.red(`Did you mean ${chalk.yellow(suggestion)}?`))
    }
  }
}

main()
