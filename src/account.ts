import cpc from 'cpchain-typescript-sdk'
import kleur from 'kleur'
import { Command } from 'commander'
import { createInterface } from 'readline'
import { Writable } from 'stream'
import fs from 'fs'
import path from 'path'

const defaultOutputDir = `${process.cwd()}/keystore`

// 至少一个字母、至少一个数字、至少一个特殊字符
const regexPassword = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/
const passwordInputHint =
  'Password must contain at least 8 characters, one uppercase letter or ' +
  'one lowercase letter, one number and one special character'

interface Options {
  outputDir: string
  unsafe: boolean
}

export default {
  loadCommands (program: Command) {
    const accountCommand = program
      .command('account')
      .description('Account management')
    accountCommand
      .command('new')
      .description('Create a new account')
      .option('-o, --output-dir <dir>', 'Output directory', defaultOutputDir)
      .option('--unsafe', 'Do not validate password (Please only use it when test!)', false)
      .action((options: Options) => {
        this.create(options)
      })
  },
  create (options: Options) {
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
      let hint = kleur.green('Please input your password')
      if (!options.unsafe) {
        hint += kleur.gray(`(${passwordInputHint})`)
      }
      hint += kleur.green(': ')
      process.stdout.write(hint)
      rl.question('pwd1', (pwd) => {
        console.log()
        if (!options.unsafe) {
          if (!regexPassword.test(pwd)) {
            console.log(kleur.red('Password is not valid!'))
            process.exit(1)
          }
        }
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
      const outputDir = path.join(process.cwd(), options.outputDir)
      const filePath = `${outputDir}/${address}.json`
      if (!fs.existsSync(outputDir)) {
        console.log(kleur.yellow(`Output directory ${outputDir} not exists, create it now!`))
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
