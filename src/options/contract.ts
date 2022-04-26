import { Command } from 'commander'

export interface ContractOptions {
  builtContract: string,
  contractAddress: string,
}

export function addContractOptions (command: Command, opts: {
  builtContract?: { required: boolean },
  contractAddress?: { required: boolean }
  } = {
  builtContract: { required: false },
  contractAddress: { required: false }
}) {
  const options = {
    builtContract: ['-b, --builtContract <path>', 'Path of built contract file'],
    contractAddress: ['-a, --contractAddress <address>', 'Address of the contract']
  }
  for (const key in options) {
    const [option, description, defaultValue] = options[key]
    if (opts[key].required) {
      command.requiredOption(option, description, defaultValue)
    } else {
      command.option(option, description, defaultValue)
    }
  }
}
