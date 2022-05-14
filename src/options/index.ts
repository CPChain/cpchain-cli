
import { OptionsIsSet } from './interface'
export { ChainOptions, addChainOptions } from './chain'
export { WalletOptions, addWalletOptions } from './wallet'
export { ConfigOptions, addConfigOptions } from './config'
export { TransactionOptions, addTransactionOptions } from './transaction'
export { ContractOptions, addContractOptions } from './contract'

export function newOptionIsSet (): OptionsIsSet {
  return {}
}
