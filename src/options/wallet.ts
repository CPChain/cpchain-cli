import { Option } from './interface'

export interface WalletOptions {
  keystore: string,
  password: string,
}

export const KeystoreOption = {
  name: 'keystore',
  description: 'Path of the keystore file',
  section: 'wallet'
} as Option

export const PasswordOption = {
  name: 'password',
  description: 'Password of the keystore file',
  section: 'wallet'
} as Option
