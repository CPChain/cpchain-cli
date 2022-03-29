import { createInterface } from 'readline'
import { Writable } from 'stream'
import kleur from 'kleur'
import fs from 'fs'

// 至少一个字母、至少一个数字、至少一个特殊字符
const regexPassword = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/
const passwordInputHint =
  'Password must contain at least 8 characters, one uppercase letter or ' +
  'one lowercase letter, one number and one special character'

const passwordHint = kleur.green('Please input your password: ')
const passwordValidator = (pwd: string) => regexPassword.test(pwd) || passwordInputHint

export default {
  inputPwdWithHint (hint: string) {
    return this.inputPwd(hint)
  },
  inputPwdWithValidator (validator: (pwd: string) => boolean | string) {
    return this.inputPwd(passwordHint, validator)
  },
  inputPwd (hint = passwordHint, validator = passwordValidator): Promise<string> {
    const rl = createInterface({
      input: process.stdin,
      output: new Writable({
        write (_chunk, _encoding, callback) {
          callback()
        }
      }),
      terminal: true
    })
    return new Promise(resolve => {
      process.stdout.write(hint)
      rl.question('pwd1', (pwd) => {
        console.log()
        const r = validator(pwd)
        if (typeof r === 'string') {
          console.log(kleur.red('Password is not valid: ' + r))
          process.exit(1)
        }
        rl.close()
        resolve(pwd)
      })
    })
  },
  fileExists (filePath: string): Promise<boolean> {
    return Promise.resolve(fs.existsSync(filePath))
  },
  fatal (msg: string) {
    this.error(msg)
    process.exit(1)
  },
  error (msg: string) {
    console.error(kleur.red(msg))
  },
  warn (msg: string) {
    console.log(kleur.yellow(msg))
  },
  info (msg: string) {
    console.log(kleur.cyan(msg))
  },
  readFile (filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  },
  readKeystore (keystorePath: string): Promise<object> {
    return new Promise((resolve, reject) => {
      fs.readFile(keystorePath, 'utf8', (err, data) => {
        if (err) {
          reject(err)
        } else {
          const keystore = JSON.parse(data)
          resolve(keystore)
        }
      })
    })
  }
}
