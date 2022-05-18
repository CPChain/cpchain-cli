import { Command } from 'commander'
import { MyCommander, options } from '../../options'
import { loadContract, createContractSdkBuilder } from '../../sol'

interface SdkGenerator {
  builtContract: string
}

async function generateSdk (options: SdkGenerator) {
  const data = loadContract(options.builtContract)
  const builder = createContractSdkBuilder()
  const result = builder.setName(data.name)
    .build()
  console.log(result)
}

export default (program: Command) => {
  const cmd = new MyCommander(program
    .command('generate-sol-sdk')
    .description('Generate a sdk of your solidity project'))
  cmd.addOption(options.BuiltContractOption)
  cmd.action(async (options: SdkGenerator) => {
    generateSdk(options)
  })
}
