import { Command } from 'commander'
import {
  MyCommander
} from '../../options'
import { createLoader, createSolcDockerCompiler } from '../../core'
import path from 'path'

function compile (filePath: string) {
  const loader = createLoader()
  const dir = loader.load(filePath)
  const compiler = createSolcDockerCompiler({})
  const entryPath = path.join(process.cwd(), dir.dir, dir.entry)
  const results = compiler.compile(entryPath)
  console.log(results)
}

export const compileCommand = (program: Command) => {
  const cmd = program
    .command('compile')
    .argument('<input-file>')
    .description('Compile solidity file')

  const myCommander = new MyCommander(cmd)
  myCommander.useConfig()

  // actions
  myCommander.action(async (options) => {
    compile(options)
  })
}
