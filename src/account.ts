import cpc from 'cpchain-typescript-sdk'
import kleur from 'kleur'
import { Command } from 'commander'
import { createInterface } from 'readline'
import { Writable } from 'stream'
import fs from 'fs'

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
        this.create()
      })
  },
  create () {
    console.log(kleur.bold().yellow('You are creating a new wallet on your disk! Please make sure your computer is safe!'))
    console.log(kleur.gray('------'))

    // get pwd
    // use readline to hide input
    // 凡重要信息输入，均采用 readline 等默认模块或自己写的模块
    const rl = createInterface({
      input: process.stdin,
      output: new Writable({
        write (_chunk, _encoding, callback) {
          callback()
        }
      }),
      terminal: true
    })

    new Promise(resolve => {
      process.stdout.write(kleur.green('Please input your password: '))
      rl.question('pwd1', (pwd) => {
        console.log()
        resolve(pwd)
      })
    }).then(pwd => {
      return new Promise((resolve, reject) => {
        process.stdout.write(kleur.green('Please input your password again: '))
        rl.question('pwd2', (pwd2) => {
          console.log()
          if (pwd === pwd2) {
            resolve(pwd2)
          } else {
            reject(new Error('Password not match!'))
          }
        })
      })
    }).then(async (pwd: string) => {
      const wallet = cpc.wallets.createWallet()
      return {
        address: wallet.address,
        keystore: await wallet.encrypt(pwd)
      }
    }).then(({ address, keystore }) => {
      const outputDir = `${process.cwd()}/keystore`
      const filePath = `${outputDir}/${address}.json`
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir)
      }
      fs.writeFileSync(filePath, keystore)
      console.log(kleur.bold().green('\nCreate wallet success!\n'))
      console.log(kleur.green('Your keystore saved in: '), kleur.underline(filePath))
      console.log(kleur.green('Your address is: '), kleur.bold(address))
    }).finally(() => {
      rl.close()
    })
  }
}
