import { createSolcDockerCompiler } from './compilers'
import { createLoader } from './loader'
import path from 'path'

process.chdir(__dirname)

test('Load and compile test', () => {
  const loader = createLoader()
  const dir = loader.load('./loader/fixtures/src/Entry.sol')
  const compiler = createSolcDockerCompiler({})
  const entryPath = path.join(__dirname, dir.dir, dir.entry)
  const results = compiler.compile(entryPath)
  console.log(results)
})
