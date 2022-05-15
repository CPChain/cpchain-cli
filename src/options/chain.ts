import { Command } from 'commander'
import { OptionsIsSet, setOptionIsSet, OptionHandler, Option } from './interface'

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

export function addChainOptions (command: Command, required: boolean = false, optionsIsSet?: OptionsIsSet) {
  const options = [
    EndpointOption,
    ChainIdOption
  ]
  for (const opt of options) {
    const { name, description, defaultValue } = opt
    const option = `--${name} <${name}>`
    const handler = setOptionIsSet(name, optionsIsSet)
    if (required) {
      command.requiredOption(option, description, handler as OptionHandler, defaultValue)
    } else {
      command.option(option, description, handler as OptionHandler, defaultValue)
    }
  }
  return command
}
