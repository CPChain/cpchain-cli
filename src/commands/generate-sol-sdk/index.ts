import { Command } from 'commander'
import { MyCommander, options } from '../../options'
import { loadContract, createContractSdkBuilder } from '../../sol'
import fs from 'fs'

interface SdkGenerator {
  builtContract: string
}

async function generateSdk (options: SdkGenerator) {
  const data = loadContract(options.builtContract)
  const builder = createContractSdkBuilder()
  builder.setName(data.contractName)
  data.listEvents().forEach(event => {
    builder.addEvent(event)
  })
  data.listMethods().forEach(method => {
    builder.addMethod(method)
  })

  const result = builder.build()
  console.log(result)
  fs.writeFileSync(`src/generated/${data.contractName}.ts`, result)
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
