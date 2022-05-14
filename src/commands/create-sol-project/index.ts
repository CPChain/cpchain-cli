import { GenerateConfig, generate } from './generate'
import { BaseContractsBuilder } from './builder/tmpls/BaseContractsBuilder'
import baseContracts from './types/base-contracts'
import boxen from 'boxen'
import prompts from 'prompts'
import { Command } from 'commander'

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

export default (program: Command) => {
  program
    .command('create <project-name>')
    .description('Create a smart-contract project which can flexible developing on CPChain')
    .action((name, options) => {
      options = options || {}
      options.name = name
      _generate(options)
    })
}
