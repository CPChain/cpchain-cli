import { Command } from 'commander'
import {
  MyCommander
} from '../../options'
import { createLoader, createSolcDockerCompiler } from '../../core'
import path from 'path'
import utils from '../../utils'
import fs from 'fs'

interface CompileProps {
  filePath: string
  output: string
}

function compile (props: CompileProps) {
  const { output, filePath } = props
  const loader = createLoader()
  const dir = loader.load(filePath)
  const compiler = createSolcDockerCompiler({})
  const entryPath = path.join(process.cwd(), dir.dir, dir.entry)
  const results = compiler.compile(entryPath)
  utils.logger.info(`Your contracts will outoput to '${output}'`)
  if (!fs.existsSync(output)) {
    fs.mkdirSync(output)
  }
  for (const c of results) {
    utils.logger.info(`Compile ${c.contractName}...`)
    fs.writeFileSync(path.join(output, `${c.contractName}.json`), JSON.stringify(c, null, '  '))
  }
  utils.logger.info('End.')
}

const OutputDirOption = {
  name: 'outputDir',
  description: 'Output directory',
  defaultValue: 'build'
}

export const compileCommand = (program: Command) => {
  const cmd = program
    .command('compile <input-file>')
    .description('Compile solidity file')

  const myCommander = new MyCommander(cmd)
  myCommander.addOption(OutputDirOption).useConfig()

  // actions
  cmd.action(async (name, options) => {
    compile({ filePath: name, output: options.outputDir })
  })
}
