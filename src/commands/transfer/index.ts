import { Command } from 'commander'
import {
  MyCommander,
  options
} from '../../options'
import utils from '../../utils'
import cpchain from 'cpchain-typescript-sdk'

async function transfer (options: any) {
  // read password
  options.password = await utils.getPasswordOrInput(options.password,
    'Password is not empty, but this is unsecure when show in the console or save in file')
  const { endpoint, chainID } = options
  const { keystore, password } = options
  const { to, amount, gasLimit } = options
  // load wallet
  const wallet = await utils.wallet.getWallet(keystore, password)
  // confirm
  const confirm = await utils.inputConfirm(`Are you sure to transfer ${amount} CPC to ${to}?`)
  if (!confirm) {
    utils.logger.info('Canceled')
    return
  }
  // load provider
  const provider = cpchain.providers.createJsonRpcProvider(endpoint, Number(chainID))
  // tx
  const tx = {
    to: to,
    from: wallet.address,
    value: cpchain.utils.parseCPC('' + amount),
    nonce: await provider.getTransactionCount(wallet.address),
    gasLimit: Number(gasLimit),
    gasPrice: await provider.getGasPrice(),
    chainId: Number(chainID)
  }
  const rawTx = await wallet.signTransaction(tx)
  const response = await provider.sendTransaction(rawTx)
  utils.logger.info(`Transaction hash: ${response.hash}`)
  utils.logger.info('Waiting the transacion be mined...')
  const receipt = await provider.waitForTransaction(response.hash)
  utils.logger.info(`Transaction status: ${receipt.status === 1 ? 'success' : 'fail'}`)
}

export default (program: Command) => {
  const cmd = program
    .command('transfer')
    .description('Transfer CPC to other account')

  const myCommander = new MyCommander(cmd)
  myCommander.addOption(options.EndpointOption)
    .addOption(options.ChainIdOption)
    .addOption(options.KeystoreOption, true)
    .addOption(options.PasswordOption, true)
    .addOption(options.TransferToOption, true)
    .addOption(options.AmountOption, true)
    .addOption(options.GasLimitOption)
    .useConfig()

  // actions
  myCommander.action(async (options) => {
    // check if config file exists
    utils.logger.info('Endpoint: ' + options.endpoint)
    utils.logger.info('Chain ID: ' + options.chainID)
    await transfer(options)
  })
}
