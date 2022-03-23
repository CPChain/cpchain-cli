import { GenerateConfig, generate } from './generate'
import { BaseContractsBuilder } from './builder/tmpls/BaseContractsBuilder'
import boxen from 'boxen'
import prompts from 'prompts'
import * as minimist from 'minimist'

function help () {
  console.log(`Usage: cpchain-cli [generate|help] [options]

Options:
  -n, --name                        contract name

--
  help, -h, --help                  print command line options

    `)
}

function whichCmd (argv: { _: [string] }) {
  return argv._.length > 0 && argv._[0]
}

function getCaller (caller: any) {
  if (typeof caller !== 'function') {
    return caller.default
  }
  return caller
}

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

async function _generate (argv: any) {
  const config = new GenerateConfig()
  const projectNameRegex = '^[a-z0-9_-]{1,20}$'
  const contractNameRegex = '^[A-Z][a-zA-Z0-9_]+'

  config.name = argv.name || argv.n || 'example'
  config.contractName = BaseContractsBuilder.covertContractName(config.name)

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
  }])
  if (!response) {
    return null
  }
  config.name = response.name
  config.contractName = response.contractName

  // dir
  config.dir = config.name
  return generate(config)
}

function main () {
  const argvCall = getCaller(minimist)
  const argv = argvCall(process.argv.slice(2))
  const cmd = whichCmd(argv)

  // show box
  showBox('CPChain CLI: A scaffold for developing smart contracts on CPChain')

  if (cmd === 'help') {
    return help()
  } else if (cmd === 'generate') {
    return _generate(argv)
  }
  help()
}

main()
