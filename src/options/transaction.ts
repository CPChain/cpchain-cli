import { Option } from './interface'

export const TransferToOption = {
  name: 'to',
  description: 'Transfer to'
} as Option

export const AmountOption = {
  name: 'amount',
  description: 'Amount (CPC)'
} as Option

export const GasLimitOption = {
  name: 'gasLimit',
  description: 'Gas limit',
  defaultValue: 1000000
} as Option
