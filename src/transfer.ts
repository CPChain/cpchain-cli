import { Command } from 'commander'
import {
  addChainOptions,
  addWalletOptions,
  addConfigOptions,
  addTransactionOptions
} from './options'
import utils from './utils'
import { loadConfig } from './configs'
import cpchain from 'cpchain-typescript-sdk'

export default {
  loadCommand (program: Command) {
    const cmd = program
      .command('transfer')
      .description('Transfer CPC to other account')
    addChainOptions(cmd)
    addWalletOptions(cmd)
    addConfigOptions(cmd)
    addTransactionOptions(cmd)
    cmd.action(async (options) => {
      // check if config file exists
      const configPath = options.config || 'cpchain-cli.toml'
      if (await utils.loader.fileExists(configPath)) {
        const config = loadConfig(configPath)
        // allow to override options of config file
        options.chainID = options.chainID || config.chain.chainID
        options.endpoint = options.endpoint || config.chain.endpoint
        options.keystore = options.keystore || config.wallet.keystore
        options.password = options.password || config.wallet.password
      } else if (!options.chainID || !options.endpoint || !options.keystore) {
        throw new Error('Config file not found, please provide --chainID, --endpoint, --keystore')
      }
      await this.transfer(options)
    })
  },
  async transfer (options: any) {
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
}
