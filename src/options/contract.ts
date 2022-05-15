import { Option } from './interface'

export interface ContractOptions {
  builtContract: string,
  contractAddress: string,
}

export const BuiltContractOption = {
  name: 'builtContract',
  description: 'Path of the built contract JSON file',
  section: 'contract'
} as Option

export const ContractAddressOption = {
  name: 'contractAddress',
  description: 'Contract address',
  section: 'contract'
} as Option

export const ParametersOption = {
  name: 'parameters',
  description: 'Parameters of the method',
  defaultValue: []
} as Option

export const MethodNameOption = {
  name: 'methodName',
  description: 'Method name'
} as Option
