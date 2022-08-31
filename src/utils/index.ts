import { createInterface } from 'readline'
import { Writable } from 'stream'
import kleur from 'kleur'
import fs from 'fs'
import loader from './loader'
import truffle from './truffle'
import logger from './logger'
import wallet from './wallet'
import boxen from 'boxen'
import prompts from 'prompts'

// 至少一个字母、至少一个数字、至少一个特殊字符
const regexPassword = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/
const passwordInputHint =
  'Password must contain at least 8 characters, one uppercase letter or ' +
  'one lowercase letter, one number and one special character'

const passwordHint = kleur.green('Please input your password: ')
const passwordValidator = (pwd: string) => regexPassword.test(pwd) || passwordInputHint
const passwordEmpty = (pwd: string) => pwd.length > 0 || 'Password is empty'

function showBox (message: string) {
  const box = boxen(message, {
    align: 'center',
    borderStyle: 'double',
    borderColor: 'green',
    dimBorder: true,
    padding: 1
  })
  console.log(box + '\n')
}

async function inputText<T extends string | number> (message: string, type?: 'string' | 'number', defaultValue?: T): Promise<T> {
  const response = await prompts([{
    type: type === 'number' ? 'number' : 'text',
    name: 'value',
    message: message,
    initial: defaultValue
  }])
  return response.value
}

export default {
  showBox,
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
        const r = validator(pwd.trim())
        if (typeof r === 'string') {
          console.log(kleur.red('Password is not valid: ' + r))
          process.exit(1)
        }
        rl.close()
        resolve(pwd.trim())
      })
    })
  },
  getPasswordOrInput (password: string | undefined, warnIfNotEmpty: string,
    hint: string = passwordHint, validator: (pwd: string) => boolean | string = passwordEmpty) {
    if (password) {
      this.logger.warn(warnIfNotEmpty)
      return password.trim()
    }
    return this.inputPwd(hint, validator)
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
  },
  readJsonFile (filePath: string): object {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  },
  inputConfirm (message: string): Promise<boolean> {
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
      process.stdout.write(kleur.green(`${message} (y/n): `))
      rl.question('', (answer) => {
        console.log()
        rl.close()
        resolve(answer.trim() === 'y')
      })
    })
  },
  inputText,
  loader,
  truffle,
  logger,
  wallet
}
