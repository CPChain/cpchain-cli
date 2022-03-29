import { Command } from 'commander'
import utils from './utils'
import cpchain from 'cpchain-typescript-sdk'

interface Options {
  keystore: string,
  password: string,
  builtContract: string,
  endpoint: string,
  chainID: number
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
      .action((options: any) => {
        this.deploy(options)
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
    const wallet = await cpchain.wallets.fromEncryptedJson(keystore, options.password)
    utils.info(`You wallet's address is ${wallet.address}`)
    const builtContract = await utils.readFile(options.builtContract)
    const contractJson = JSON.parse(builtContract)

    // validate contract json
    if (contractJson.abi === undefined || contractJson.bytecode === undefined || contractJson.contractName === undefined) {
      utils.fatal('Invalid contract file: missing abi, bytecode or contractName')
    }

    utils.info(`Deploying ${contractJson.contractName} contract...`)

    const provider = cpchain.providers.createJsonRpcProvider(options.endpoint, options.chainID)
    const account = wallet.connect(provider)

    const contractFactory = new cpchain.contract.ContractFactory(contractJson.abi, contractJson.bytecode, account)
    const myContract = await contractFactory.deploy()

    await myContract.deployTransaction.wait()
    utils.info(`Contract address is ${myContract.address}`)
  }
}
