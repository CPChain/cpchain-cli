import { GenerateConfig, generate } from './generate'
import { BaseContractsBuilder } from './builder/tmpls/BaseContractsBuilder'
import baseContracts from './types/base-contracts'
// import account from './account'
import boxen from 'boxen'
import prompts from 'prompts'
import { program } from 'commander'
import projectConfig from '../package.json'
import chalk from 'chalk'
import leven from 'leven'
import createContractCommand from './commands/contract'
import createServer from './create-server'
import createTransferCommand from './commands/transfer'
import createAccountCommand from './commands/account'

function showBox (message: string) {
  const box = boxen(message, {
    align: 'center',
    borderStyle: 'double',
    borderColor: 'green',
    dimBorder: true,
    padding: 1
  })
  console.log(box + '\n')
}

async function _generate (options: {name: string}) {
  const config = new GenerateConfig()
  const projectNameRegex = '^[a-z0-9_-]{1,20}$'
  const contractNameRegex = '^[A-Z][a-zA-Z0-9_]+'

  config.name = options.name || 'example'
  config.contractName = BaseContractsBuilder.covertContractName(config.name)

  const baseContractsChoices = []

  for (const c of baseContracts) {
    baseContractsChoices.push({
      title: c.name,
      value: c
    })
  }

  const response = await prompts([{
    type: 'text',
    name: 'name',
    message: 'Project name',
    initial: config.name,
    validate: value => (new RegExp(projectNameRegex)).test(value) ? true : `Project name should match ${projectNameRegex}`
  }, {
    type: 'text',
    name: 'contractName',
    message: 'Contract Name',
    initial: config.contractName,
    validate: value => (new RegExp(contractNameRegex)).test(value) ? true : `Contract name should match ${contractNameRegex}`
  }, {
    type: 'multiselect',
    name: 'needsPackages',
    message: 'Select default packages (multi select)',
    choices: baseContractsChoices
  }])
  if (!response) {
    return null
  }
  config.name = response.name
  config.contractName = response.contractName
  config.needsPackages = response.needsPackages

  // dir
  config.dir = config.name
  generate(config)

  // show help
  const box = boxen(`Your project ${config.name} have been created! Please execute below commands to start:
---
cd ${config.name}
npm install
npm run test
`, {
    align: 'left',
    borderStyle: 'double',
    borderColor: 'green',
    dimBorder: true,
    padding: 1
  })
  console.log(box + '\n')
}

function main () {
  // show box
  showBox('CPChain CLI: A scaffold for developing smart contracts on CPChain')

  // program
  program
    .version(`cpchain-cli ${projectConfig.version}`)
    .usage('<command> [options]')

  program
    .command('create <project-name>')
    .description('Create a smart-contract project which can flexible developing on CPChain')
    .action((name, options) => {
      options = options || {}
      options.name = name
      _generate(options)
    })

  // Account management
  createAccountCommand(program)
  // Contract management
  createContractCommand(program)
  // Create server
  createServer.loadCommands(program)
  // Transfer
  createTransferCommand(program)

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
