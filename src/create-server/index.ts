import { Command } from 'commander'
import fs from 'fs'
import utils from '../utils'
import { AbiItemType, EventItem, loadContract } from './types'

const defaultOutputDir = 'example-server'

interface Options {
  outputDir: string
  builtContract: string
}

export default {
  loadCommands (program: Command) {
    program
      .command('create-server')
      .description('Generate server codo for smart contract')
      .option('-o, --output-dir <dir>', 'Output directory', defaultOutputDir)
      .requiredOption('-B, --built-contract <path>', 'The built json file')
      .action((options: Options) => {
        this.createServer(options)
      })
  },
  createServer (options: Options) {
    // check if file exists
    if (!fs.existsSync(options.builtContract)) {
      utils.logger.error(`The file ${options.builtContract} does not exist!`)
      return
    }
    utils.logger.info('Generating server code...')
    const builtData = loadContract(options.builtContract)
    const abi = builtData.abi
    const events = abi.filter(item => item.type === AbiItemType.EVENT)
    console.log(events)
    for (let e of events) {
      e = e as EventItem
      if (e.inputs.length > 0) {
        console.log(e.inputs)
      }
    }
  }
}
