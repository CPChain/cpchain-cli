
import { OptionsIsSet } from './interface'
import { EndpointOption, ChainIdOption } from './chain'
export { MyCommander } from './interface'
export { ChainOptions, addChainOptions } from './chain'
export { WalletOptions, addWalletOptions } from './wallet'
export { ConfigOptions, addConfigOptions } from './config'
export { TransactionOptions, addTransactionOptions } from './transaction'
export { ContractOptions, addContractOptions } from './contract'

export const options = {
  EndpointOption,
  ChainIdOption
}

export function newOptionIsSet (): OptionsIsSet {
  return {}
}
