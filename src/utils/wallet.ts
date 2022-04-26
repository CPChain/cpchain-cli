import cpchain from 'cpchain-typescript-sdk'
import loader from './loader'
import logger from './logger'

export default {
  async getWallet (keystorePath: string, password: string) {
    const keystore = await loader.readFile(keystorePath)
    const wallet = await cpchain.wallets.fromEncryptedJson(keystore, password)
    logger.info(`You wallet's address is ${wallet.address}`)
    return wallet
  }
}
