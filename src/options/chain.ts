import { Option } from './interface'

const DEFAULT_RPC_URL = 'https://civilian.testnet.cpchain.io'
const DEFAULT_CHAIN_ID = 41

export const EndpointOption = {
  name: 'endpoint',
  description: 'RPC endpoint',
  defaultValue: DEFAULT_RPC_URL,
  section: 'chain'
} as Option

export const ChainIdOption = {
  name: 'chainID',
  description: 'Chain ID',
  defaultValue: DEFAULT_CHAIN_ID,
  section: 'chain'
} as Option

export interface ChainOptions {
  endpoint: string,
  chainID: number,
}
