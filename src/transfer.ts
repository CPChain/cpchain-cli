import { Command } from 'commander'
import {
  addChainOptions,
  addWalletOptions,
  addConfigOptions,
  addTransactionOptions
} from './options'
import utils from './utils'
import { loadConfig } from './configs'

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
        const config = await loadConfig(configPath)
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
    console.log(endpoint, chainID, keystore, password)
    console.log(to, amount, gasLimit)
    // load wallet
    const wallet = await utils.wallet.getWallet(keystore, password)
    console.log(wallet.address)

    // const { to, amount, memo } = options
    // const { address, privateKey } = await importKeystore(keystore, password)
    // const { nonce, gasPrice, gasLimit } = await getNonceAndGasPriceAndGasLimit(endpoint, address, chainID)
    // const tx = await createTransferTx(address, to, amount, memo, nonce, gasPrice, gasLimit)
    // const signedTx = signTx(privateKey, tx)
    // const result = await sendTx(endpoint, signedTx)
    // console.log(result)
  }
}
