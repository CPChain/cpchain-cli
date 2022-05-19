import { Command } from 'commander'
import { MyCommander, options } from '../../options'
import { loadContract, createContractSdkBuilder } from '../../sol'
import fs from 'fs'
import utils from '../../utils'

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

  const generatedFile = `src/generated/${data.contractName}.ts`
  // create src/generated directory if not exists
  if (!fs.existsSync('src/generated')) {
    fs.mkdirSync('src/generated')
  }

  const result = builder.build()
  utils.logger.info(`Generated code in ${generatedFile}`)
  utils.showBox('Below is the demo code to test the generated code:')
  utils.logger.info('------------------------------------------------------')
  console.log(result.demo)
  utils.logger.info('------------------------------------------------------')
  fs.writeFileSync(generatedFile, result.result)
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
