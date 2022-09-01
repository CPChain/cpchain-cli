import { Command } from 'commander'
import {
  MyCommander,
  options
} from '../../options'
import utils from '../../utils'
import cpchain, { Erc20Abi, Erc20ByteCode, Erc20TokenImpl } from 'cpchain-typescript-sdk'
import { ChainIdOption, EndpointOption } from '../../options/chain'
import { ContractAddressOption } from '../../options/contract'

async function publishToken (options: any) {
  // read password
  options.password = await utils.getPasswordOrInput(options.password,
    'Password is not empty, but this is unsecure when show in the console or save in file')
  const { endpoint, chainID } = options
  const { keystore, password } = options
  // load wallet
  const wallet = await utils.wallet.getWallet(keystore, password)

  // read Token name
  const tokenName = await utils.inputText('Please input token name:')
  const symbol = await utils.inputText('Please input token symbol:')
  const decimals = 18
  const initialAmount = await utils.inputText('Please input the initial amount:', 'number')

  // confirm
  const confirm = await utils.inputConfirm(`Are you sure to publish token ${tokenName}?`)
  if (!confirm) {
    utils.logger.info('Canceled')
    return
  }

  // load provider
  const provider = cpchain.providers.createJsonRpcProvider(endpoint, Number(chainID))
  const account = wallet.connect(provider)

  const contractFactory = new cpchain.contract.ContractFactory(Erc20Abi, Erc20ByteCode, account)
  const myContract = await contractFactory.deploy(tokenName, symbol, decimals, initialAmount)

  const tx = await myContract.deployTransaction.wait()
  utils.logger.info(`Tx hash is ${tx.transactionHash}`)
  utils.logger.info(`Contract address is ${myContract.address}`)
}

export const publishTokenCmd = (program: Command) => {
  const cmd = program
    .command('publish-token')
    .description('Publish a token to the chain')

  const myCommander = new MyCommander(cmd)
  myCommander.addOption(options.EndpointOption)
    .addOption(options.ChainIdOption)
    .addOption(options.KeystoreOption, true)
    .addOption(options.PasswordOption, true)
    .useConfig()

  // actions
  myCommander.action(async (options) => {
    // check if config file exists
    utils.logger.info('Endpoint: ' + options.endpoint)
    utils.logger.info('Chain ID: ' + options.chainID)
    await publishToken(options)
  })
}

export const tokenInfoCmd = (program: Command) => {
  const cmd = program
    .command('token')
    .description('Get token info')
  const myCommander = new MyCommander(cmd)
  myCommander.addOption(ChainIdOption)
    .addOption(EndpointOption)
    .addOption(ContractAddressOption, true)
    .useConfig()
  myCommander.action(async (options) => {
    const { endpoint, chainID, contractAddress } = options
    utils.logger.info('Endpoint: ' + endpoint)
    utils.logger.info('ChainID: ' + chainID)
    console.log()
    const provider = cpchain.providers.createJsonRpcProvider(endpoint, Number(chainID))
    const token = new Erc20TokenImpl(provider, contractAddress)
    try {
      const name = await token.name()
      const symbol = await token.symbol()
      const totalSupply = await token.totalSupply()
      const decimals = await token.decimals()
      utils.logger.info(`Token: ${name}(${symbol})`)
      utils.logger.info(`Decimals: ${decimals}`)
      utils.logger.info('Total supply: ' + (cpchain.utils.formatCPC(totalSupply)) + ` ${symbol}`)
    } catch (err) {
      const msg = err && err.message
      if (msg.startsWith('call revert exception ')) {
        utils.logger.error(`${contractAddress} maybe not a contract, please check it.`)
      }
      console.log()
      utils.logger.error('Error: ' + msg)
    }
  })
}
