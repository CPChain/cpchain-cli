import { Command } from 'commander'
import utils from '../../utils'
import cpc, { CPCWallet } from 'cpchain-typescript-sdk'
import path from 'path'
import {
  ChainOptions,
  WalletOptions,
  ContractOptions,
  MyCommander,
  options
} from '../../options'

const contract = cpc.contract
const providers = cpc.providers
const wallets = cpc.wallets

interface Options extends ChainOptions, WalletOptions, ContractOptions {
  methodName: string,
  parameters: string[]
  amount: string,
  project: string
}

async function validateChain (options: Options) {
  // check chainID
  if (!options.chainID) {
    utils.logger.fatal('Chain ID is required')
  }
  options.chainID = Number(options.chainID)
}

async function validateWallet (options: Options) {
  // check if keystore file exists
  if (!(await utils.loader.fileExists(options.keystore))) {
    utils.logger.fatal(`Keystore file "${options.keystore}" not found`)
  }
}

async function getAccount (options: Options): Promise<CPCWallet> {
  // check or require-input password
  if (!options.password) {
    options.password = await utils.inputPwdWithValidator((pwd: string) => {
      return pwd.length > 0 || 'Password is empty'
    })
  } else {
    utils.logger.warn('Password is not empty, but this is unsecure when show in the console')
  }
  options.password = options.password.trim()
  const keystore = await utils.loader.readFile(options.keystore)
  const wallet = await wallets.fromEncryptedJson(keystore, options.password)
  const provider = providers.createJsonRpcProvider(options.endpoint, options.chainID)
  const account = wallet.connect(provider)
  return account
}

async function deploy (options: Options) {
  // check if keystore file exists
  if (!(await utils.loader.fileExists(options.keystore))) {
    utils.logger.fatal(`Keystore file "${options.keystore}" not found`)
  }
  // check if contract file exists
  if (!(await utils.loader.fileExists(options.builtContract))) {
    utils.logger.fatal(`Contract file "${options.builtContract}" not found`)
  }
  // check chainID
  if (!options.chainID) {
    utils.logger.fatal('Chain ID is required')
  }
  options.chainID = Number(options.chainID)
  // check or require-input password
  options.password = await utils.getPasswordOrInput(options.password,
    'Password is not empty, but this is unsecure when show in the console')
  const keystore = await utils.loader.readFile(options.keystore)
  const wallet = await wallets.fromEncryptedJson(keystore, options.password)
  utils.logger.info(`You wallet's address is ${wallet.address}`)
  const builtContract = await utils.loader.readFile(options.builtContract)
  const contractJson = JSON.parse(builtContract)

  // validate contract json
  if (contractJson.abi === undefined || contractJson.bytecode === undefined || contractJson.contractName === undefined) {
    utils.logger.fatal('Invalid contract file: missing abi, bytecode or contractName')
  }

  utils.logger.info(`Deploying ${contractJson.contractName} contract...`)

  const provider = providers.createJsonRpcProvider(options.endpoint, options.chainID)
  const account = wallet.connect(provider)

  const contractFactory = new contract.ContractFactory(contractJson.abi, contractJson.bytecode, account)
  const myContract = await contractFactory.deploy(...options.parameters)

  await myContract.deployTransaction.wait()
  utils.logger.info(`Contract address is ${myContract.address}`)
}

async function getContract (options: Options) : Promise<any> {
  const builtContract = await utils.loader.readFile(options.builtContract)
  const contractJson = JSON.parse(builtContract)
  if (contractJson.abi === undefined || contractJson.contractName === undefined) {
    utils.logger.fatal('Invalid contract file: missing abi, bytecode or contractName')
  }
  utils.logger.info(`Calling ${options.methodName} method of ${contractJson.contractName} contract...`)
  options.chainID = Number(options.chainID)
  const provider = providers.createJsonRpcProvider(options.endpoint, options.chainID)
  const myContract = new contract.Contract(options.contractAddress, contractJson.abi, provider)
  return myContract
}

async function getContractWithSigner (options: Options): Promise <any> {
  const builtContract = await utils.loader.readFile(options.builtContract)
  const contractJson = JSON.parse(builtContract)
  if (contractJson.abi === undefined || contractJson.contractName === undefined) {
    utils.logger.fatal('Invalid contract file: missing abi, bytecode or contractName')
  }
  utils.logger.info(`Calling ${options.methodName} method of ${contractJson.contractName} contract...`)
  options.chainID = Number(options.chainID)
  const provider = providers.createJsonRpcProvider(options.endpoint, options.chainID)
  // check or require-input password
  if (!options.password) {
    options.password = await utils.inputPwdWithValidator((pwd: string) => {
      return pwd.length > 0 || 'Password is empty'
    })
  } else {
    utils.logger.warn('Password is not empty, but this is unsecure when show in the console')
  }
  options.password = options.password.trim()
  const keystore = await utils.loader.readFile(options.keystore)
  const wallet = await wallets.fromEncryptedJson(keystore, options.password)
  const account = wallet.connect(provider)
  const myContract = new contract.Contract(options.contractAddress, contractJson.abi, account)
  return myContract
}

async function callViewMethod (options: Options) {
  const myContract = await getContract(options)
  if (!myContract[options.methodName]) {
    utils.logger.fatal(`Method ${options.methodName} not found`)
  }
  if (options.parameters && typeof options.parameters === 'string') {
    options.parameters = (options.parameters as string).split(',')
  }
  const r = await myContract[options.methodName](...options.parameters)
  console.log(r)
}

async function callMethod (options: Options) {
  const myContract = await getContractWithSigner(options)
  if (!myContract[options.methodName]) {
    utils.logger.fatal(`Method ${options.methodName} not found`)
  }
  const params: {value?: any} = {}
  if (options.amount) {
    params.value = cpc.utils.parseCPC(options.amount)
  }
  if (options.parameters && typeof options.parameters === 'string') {
    options.parameters = (options.parameters as string).split(',')
  }
  const tx = await myContract[options.methodName](...options.parameters, params)
  utils.logger.info(`Transaction hash is ${tx.hash}, please wait for confirmation...`)
  await tx.wait()
  utils.logger.info(`Transaction ${tx.hash} has been sent`)
}

async function truffleDeploy (options: Options) {
  await validateWallet(options)
  await validateChain(options)
  const signer = await getAccount(options)
  if (!utils.loader.fileExists(options.project)) {
    utils.logger.fatal('Project not exists')
  }
  if (options.project === '.') {
    options.project = process.cwd()
  }
  if (!utils.loader.isDirectory(options.project)) {
    utils.logger.fatal('Project should be a directory, but got a file')
  }
  // check if migrations/2_deploy_contracts.js exists
  const target = path.join(options.project, 'migrations', '2_deploy_contracts.js')
  if (!(await utils.loader.fileExists(target))) {
    utils.logger.fatal(`2_deploy_contracts.js not found in ${options.project}/migrations directory`)
  }
  await utils.truffle.loadMigration(target, signer)
}

export default (program: Command) => {
  const contractCommand = program
    .command('contract')
    .description('Smart contracts management')
  // Deploy Comander
  const deployCommand = new MyCommander(contractCommand
    .command('deploy')
    .description('Deploy a smart contract'))
  deployCommand.addOption(options.ChainIdOption)
    .addOption(options.EndpointOption)
    .addOption(options.KeystoreOption)
    .addOption(options.PasswordOption)
    .addOption(options.BuiltContractOption, true)
    .addOption(options.AmountOption)
    .addOption(options.ParametersOption)
    .useConfig()
    .action(async (options: any) => {
      utils.logger.info('Endpoint: ' + options.endpoint)
      utils.logger.info('Chain ID: ' + options.chainID)
      deploy(options)
    })

  // View Commander
  const viewCommaner = new MyCommander(contractCommand
    .command('view')
    .description('Call a view method a smart contract'))
  viewCommaner.addOption(options.ChainIdOption)
    .addOption(options.EndpointOption)
    .addOption(options.ContractAddressOption)
    .addOption(options.BuiltContractOption, true)
    .addOption(options.MethodNameOption, true)
    .addOption(options.AmountOption)
    .addOption(options.ParametersOption)
    .useConfig()
    .action(async (options: any) => {
      callViewMethod(options)
    })

  // Call commander
  const callCommaner = new MyCommander(contractCommand
    .command('call')
    .description('Call a method a smart contract'))
  callCommaner.addOption(options.ChainIdOption)
    .addOption(options.EndpointOption)
    .addOption(options.ContractAddressOption)
    .addOption(options.KeystoreOption)
    .addOption(options.PasswordOption)
    .addOption(options.BuiltContractOption, true)
    .addOption(options.MethodNameOption, true)
    .addOption(options.AmountOption)
    .addOption(options.ParametersOption)
    .addOption(options.GasLimitOption)
    .useConfig()
    .action(async (options: any) => {
      callMethod(options)
    })

  // Deploy truffle project
  const truffleCommand = new MyCommander(contractCommand.command('deploy-truffle')
    .description('Deploy a truffle project')
    .requiredOption('-P, --project <path>', 'Path of truffle project, default is current floder', '.'))
  truffleCommand.addOption(options.ChainIdOption)
    .addOption(options.EndpointOption)
    .addOption(options.KeystoreOption)
    .addOption(options.PasswordOption)
    .useConfig()
    .action(async (options: any) => {
      truffleDeploy(options)
    })
  return contractCommand
}
