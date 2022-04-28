import { Command } from 'commander'

export interface ChainOptions {
  endpoint: string,
  chainID: number,
}

export function addChainOptions (command: Command, required: boolean = false) {
  const options = {
    endpoint: ['--endpoint <url>', 'Endpoint of the blockchain'],
    chainID: ['--chainID <id>', 'Chain ID of the blockchain']
  }
  for (const key in options) {
    const [option, description, defaultValue] = options[key]
    if (required) {
      command.requiredOption(option, description, defaultValue)
    } else {
      command.option(option, description, defaultValue)
    }
  }
  return command
}
