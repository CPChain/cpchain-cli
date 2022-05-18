
import { OptionsIsSet } from './interface'
import { EndpointOption, ChainIdOption } from './chain'
import { KeystoreOption, PasswordOption } from './wallet'
import { TransferToOption, GasLimitOption, AmountOption } from './transaction'
import {
  BuiltContractOption,
  ContractAddressOption,
  ParametersOption,
  MethodNameOption
} from './contract'
import { OutputDirOption } from './outputDir'
export { MyCommander } from './interface'
export type { ChainOptions } from './chain'
export type { WalletOptions } from './wallet'
export type { ContractOptions } from './contract'

export const options = {
  EndpointOption,
  ChainIdOption,
  KeystoreOption,
  PasswordOption,
  TransferToOption,
  GasLimitOption,
  AmountOption,
  BuiltContractOption,
  ContractAddressOption,
  ParametersOption,
  MethodNameOption,
  OutputDirOption
}

export function newOptionIsSet (): OptionsIsSet {
  return {}
}
