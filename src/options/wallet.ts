import { Command } from 'commander'

export interface WalletOptions {
  keystore: string,
  password: string,
}

export function addWalletOptions (command: Command,
  opts: { keystore: {required: boolean}, password: {required: boolean} } =
  { keystore: { required: false }, password: { required: false } }) {
  const options = {
    keystore: ['-k, --keystore <path>', 'Path of keystore file'],
    password: ['-p, --password <pwd>', 'Password of keystore file']
  }
  for (const key in options) {
    const [option, description, defaultValue] = options[key]
    if (opts[key].required) {
      command.requiredOption(option, description, defaultValue)
    } else {
      command.option(option, description, defaultValue)
    }
  }
  return command
}
