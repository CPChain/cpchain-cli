import { Command } from 'commander'

export interface TransactionOptions {
  to: string
  amount: number
  gasLimit: number
}

export function addTransactionOptions (command: Command, opts: {
  to: { required: boolean },
  amount: { required: boolean },
  gasLimit: { required: boolean }
} = { to: { required: true }, amount: { required: true }, gasLimit: { required: false } }) {
  const options = {
    to: ['-t, --to <address>', 'Address of the receiver'],
    amount: ['-a, --amount <number>', 'Amount of CPC to transfer'],
    gasLimit: ['-g, --gasLimit <number>', 'Gas limit of the transaction', '1000000']
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
