import cpc from 'cpchain-typescript-sdk'
import { Command } from 'commander'

export default {
  loadCommands (program: Command) {
    const accountCommand = program
      .command('account')
      .description('Account management')
    accountCommand
      .command('new')
      .description('Create a new account')
      .allowUnknownOption()
      .action(() => {
        const wallet = cpc.wallets.createWallet()
        console.log(wallet.address)
      })
  },
  create () {
    return cpc.wallets.createWallet()
  }
}
