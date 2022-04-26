import { Command } from 'commander'
import utils from './utils'
import cpc from 'cpchain-typescript-sdk'
import { CPCWallet } from 'cpchain-typescript-sdk/lib/src/wallets'
import path from 'path'
import { ChainOptions, addChainOptions, WalletOptions, addWalletOptions } from './options'

const contract = cpc.contract
const providers = cpc.providers
const wallets = cpc.wallets

interface Options extends ChainOptions, WalletOptions{
  methodName: string,
  builtContract: string,
  contractAddress: string,
  parameters: string[]
  amount: string,
  project: string
}

function addContractOptions ({ command, method, contractAddress, builtContract }:
  { command: Command, method: boolean, contractAddress: boolean, builtContract: boolean }) {
  command
    .option('-a, --parameters [parameters...]', 'Arguments of the contract\'s constructor')
    .option('--amount <amount>', 'Amount of the transaction (CPC)', '0')
  if (method) {
    command.requiredOption('-m --method-name <name>', 'Name of the method')
  }
  if (contractAddress) {
    command.requiredOption('--contract-address <address>', 'Address of the contract')
  }
  if (builtContract) {
    command.requiredOption('-c, --built-contract <path>', 'Path of built contract file')
  }
  return command
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

export default {
  loadCommand (program: Command) {
    const contractCommand = program
      .command('contract')
      .description('Smart contracts management')
    // Deploy Comander
    const deployCommand = contractCommand
      .command('deploy')
      .description('Deploy a smart contract')
    addChainOptions(deployCommand)
    addWalletOptions(deployCommand)
    addContractOptions({ command: deployCommand, method: false, contractAddress: false, builtContract: true })
    deployCommand
      .action((options: any) => {
        this.deploy(options)
      })
    // View Commander
    const viewCommaner = contractCommand
      .command('view')
      .description('Call a view method a smart contract')
    addChainOptions(viewCommaner)
    addContractOptions({ command: viewCommaner, method: true, contractAddress: true, builtContract: true })
    viewCommaner.action((options: any) => {
      options.parameters = options.parameters || []
      this.callViewMethod(options)
    })
    // Call commander
    const callCommaner = contractCommand
      .command('call')
      .description('Call a method a smart contract')
    addChainOptions(callCommaner)
    addWalletOptions(callCommaner)
    addContractOptions({ command: callCommaner, method: true, contractAddress: true, builtContract: true })
    callCommaner.action((options: any) => {
      options.parameters = options.parameters || []
      this.callMethod(options)
    })
    // Deploy truffle project
    const truffleCommand = contractCommand.command('deploy-truffle')
      .description('Deploy a truffle project')
      .option('-P, --project <path>', 'Path of truffle project, default is current floder', '.')
    addChainOptions(truffleCommand)
    addWalletOptions(truffleCommand)
    addContractOptions({ command: truffleCommand, method: false, contractAddress: false, builtContract: false })
    truffleCommand.action((options: any) => {
      this.truffleDeploy(options)
    })
  },
  async deploy (options: Options) {
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
  },
  async getContract (options: Options) : Promise<any> {
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
  },
  async getContractWithSigner (options: Options): Promise <any> {
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
  },
  async callViewMethod (options: Options) {
    const myContract = await this.getContract(options)
    if (!myContract[options.methodName]) {
      utils.logger.fatal(`Method ${options.methodName} not found`)
    }
    const r = await myContract[options.methodName](...options.parameters)
    console.log(r)
  },
  async callMethod (options: Options) {
    const myContract = await this.getContractWithSigner(options)
    if (!myContract[options.methodName]) {
      utils.logger.fatal(`Method ${options.methodName} not found`)
    }
    const tx = await myContract[options.methodName](...options.parameters, {
      value: cpc.utils.parseCPC(options.amount)
    })
    utils.logger.info(`Transaction hash is ${tx.hash}, please wait for confirmation...`)
    await tx.wait()
    utils.logger.info(`Transaction ${tx.hash} has been sent`)
  },
  async truffleDeploy (options: Options) {
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
}
