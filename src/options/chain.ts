import { Command } from 'commander'
import { OptionsIsSet, setOptionIsSet, OptionHandler } from './interface'

const DEFAULT_RPC_URL = 'https://civilian.testnet.cpchain.io'
const DEFAULT_CHAIN_ID = 41

export interface ChainOptions {
  endpoint: string,
  chainID: number,
}

export function addChainOptions (command: Command, required: boolean = false, optionsIsSet?: OptionsIsSet) {
  const options = {
    endpoint: ['--endpoint <url>', 'Endpoint of the blockchain', setOptionIsSet('endpoint', optionsIsSet), DEFAULT_RPC_URL],
    chainID: ['--chainID <id>', 'Chain ID of the blockchain', setOptionIsSet('chainID', optionsIsSet), DEFAULT_CHAIN_ID]
  }
  for (const key in options) {
    const [option, description, handler, defaultValue] = options[key]
    if (required) {
      command.requiredOption(option, description, handler as OptionHandler, defaultValue)
    } else {
      command.option(option, description, handler as OptionHandler, defaultValue)
    }
  }
  return command
}
