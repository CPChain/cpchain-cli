import { Command } from 'commander'
import { MyCommander, options } from '../../options'

export default (program: Command) => {
  const cmd = new MyCommander(program
    .command('generate-sol-sdk')
    .description('Generate a sdk of your solidity project'))
  cmd.addOption(options.BuiltContractOption)
}
