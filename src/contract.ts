import { Command } from 'commander'
import utils from './utils'
import cpc from 'cpchain-typescript-sdk'

const contract = cpc.contract
const providers = cpc.providers
const wallets = cpc.wallets

interface Options {
  keystore: string,
  password: string,
  builtContract: string,
  endpoint: string,
  chainID: number,
  parameters: string[]
}

interface ViewMethodOptions {
  methodName: string,
  builtContract: string,
  contractAddress: string,
  endpoint: string,
  chainID: number,
  parameters: string[]
}

interface CallMethodOptions extends ViewMethodOptions {
  amount: string,
  keystore: string,
  password: string,
}

export default {
  loadCommand (program: Command) {
    const contractCommand = program
      .command('contract')
      .description('Smart contracts management')
    contractCommand
      .command('deploy')
      .description('Deploy a smart contract')
      .requiredOption('-k, --keystore <path>', 'Path of keystore file')
      .option('-p, --password <pwd>', 'Password of keystore file')
      .requiredOption('-c, --built-contract <path>', 'Path of built contract file')
      .requiredOption('--endpoint <url>', 'Endpoint of the blockchain')
      .requiredOption('--chainID <id>', 'Chain ID of the blockchain')
      .option('-a, --parameters [parameters...]', 'Arguments of the contract\'s constructor')
      .action((options: any) => {
        this.deploy(options)
      })
    contractCommand
      .command('view')
      .description('Call a view method a smart contract')
      .requiredOption('-m --method-name <name>', 'Name of the view method')
      .requiredOption('-c, --built-contract <path>', 'Path of built contract file')
      .requiredOption('--contract-address <address>', 'Address of the contract')
      .option('--endpoint <url>', 'Endpoint of the blockchain', 'https://civilian.testnet.cpchain.io')
      .option('--chainID <id>', 'Chain ID of the blockchain', '41')
      .option('-a, --parameters [parameters...]', 'Arguments of the contract\'s constructor')
      .action((options: any) => {
        options.parameters = options.parameters || []
        this.callViewMethod(options)
      })
    contractCommand
      .command('call')
      .description('Call a method a smart contract')
      .requiredOption('-k, --keystore <path>', 'Path of keystore file')
      .option('-p, --password <pwd>', 'Password of keystore file')
      .requiredOption('-m --method-name <name>', 'Name of the method')
      .requiredOption('-c, --built-contract <path>', 'Path of built contract file')
      .requiredOption('--contract-address <address>', 'Address of the contract')
      .option('--endpoint <url>', 'Endpoint of the blockchain', 'https://civilian.testnet.cpchain.io')
      .option('--chainID <id>', 'Chain ID of the blockchain', '41')
      .option('-a, --parameters [parameters...]', 'Arguments of the contract\'s constructor')
      .option('--amount <amount>', 'Amount of the transaction (CPC)', '0')
      .action((options: any) => {
        options.parameters = options.parameters || []
        this.callMethod(options)
      })
  },
  async deploy (options: Options) {
    // check if keystore file exists
    if (!(await utils.fileExists(options.keystore))) {
      utils.fatal(`Keystore file "${options.keystore}" not found`)
    }
    // check if contract file exists
    if (!(await utils.fileExists(options.builtContract))) {
      utils.fatal(`Contract file "${options.builtContract}" not found`)
    }
    // check chainID
    if (!options.chainID) {
      utils.fatal('Chain ID is required')
    }
    options.chainID = Number(options.chainID)
    // check or require-input password
    if (!options.password) {
      options.password = await utils.inputPwdWithValidator((pwd: string) => {
        return pwd.length > 0 || 'Password is empty'
      })
    } else {
      utils.warn('Password is not empty, but this is unsecure when show in the console')
    }
    options.password = options.password.trim()
    const keystore = await utils.readFile(options.keystore)
    const wallet = await wallets.fromEncryptedJson(keystore, options.password)
    utils.info(`You wallet's address is ${wallet.address}`)
    const builtContract = await utils.readFile(options.builtContract)
    const contractJson = JSON.parse(builtContract)

    // validate contract json
    if (contractJson.abi === undefined || contractJson.bytecode === undefined || contractJson.contractName === undefined) {
      utils.fatal('Invalid contract file: missing abi, bytecode or contractName')
    }

    utils.info(`Deploying ${contractJson.contractName} contract...`)

    const provider = providers.createJsonRpcProvider(options.endpoint, options.chainID)
    const account = wallet.connect(provider)

    const contractFactory = new contract.ContractFactory(contractJson.abi, contractJson.bytecode, account)
    const myContract = await contractFactory.deploy(...options.parameters)

    await myContract.deployTransaction.wait()
    utils.info(`Contract address is ${myContract.address}`)
  },
  async getContract (options: ViewMethodOptions) : Promise<any> {
    const builtContract = await utils.readFile(options.builtContract)
    const contractJson = JSON.parse(builtContract)
    if (contractJson.abi === undefined || contractJson.contractName === undefined) {
      utils.fatal('Invalid contract file: missing abi, bytecode or contractName')
    }
    utils.info(`Calling ${options.methodName} method of ${contractJson.contractName} contract...`)
    options.chainID = Number(options.chainID)
    const provider = providers.createJsonRpcProvider(options.endpoint, options.chainID)
    const myContract = new contract.Contract(options.contractAddress, contractJson.abi, provider)
    return myContract
  },
  async getContractWithSigner (options: CallMethodOptions): Promise <any> {
    const builtContract = await utils.readFile(options.builtContract)
    const contractJson = JSON.parse(builtContract)
    if (contractJson.abi === undefined || contractJson.contractName === undefined) {
      utils.fatal('Invalid contract file: missing abi, bytecode or contractName')
    }
    utils.info(`Calling ${options.methodName} method of ${contractJson.contractName} contract...`)
    options.chainID = Number(options.chainID)
    const provider = providers.createJsonRpcProvider(options.endpoint, options.chainID)
    // check or require-input password
    if (!options.password) {
      options.password = await utils.inputPwdWithValidator((pwd: string) => {
        return pwd.length > 0 || 'Password is empty'
      })
    } else {
      utils.warn('Password is not empty, but this is unsecure when show in the console')
    }
    options.password = options.password.trim()
    const keystore = await utils.readFile(options.keystore)
    const wallet = await wallets.fromEncryptedJson(keystore, options.password)
    const account = wallet.connect(provider)
    const myContract = new contract.Contract(options.contractAddress, contractJson.abi, account)
    return myContract
  },
  async callViewMethod (options: ViewMethodOptions) {
    const myContract = await this.getContract(options)
    if (!myContract[options.methodName]) {
      utils.fatal(`Method ${options.methodName} not found`)
    }
    const r = await myContract[options.methodName](...options.parameters)
    console.log(r)
  },
  async callMethod (options: CallMethodOptions) {
    const myContract = await this.getContractWithSigner(options)
    if (!myContract[options.methodName]) {
      utils.fatal(`Method ${options.methodName} not found`)
    }
    const tx = await myContract[options.methodName](...options.parameters, {
      value: cpc.utils.parseCPC(options.amount)
    })
    utils.info(`Transaction hash is ${tx.hash}, please wait for confirmation...`)
    await tx.wait()
    utils.info(`Transaction ${tx.hash} has been sent`)
  }
}
