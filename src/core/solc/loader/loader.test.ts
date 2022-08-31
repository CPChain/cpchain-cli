import { createLoader } from './loader'

// Change to current directory
process.chdir(__dirname)

test('Load contracts from entry contract', () => {
  const loader = createLoader()
  const dir = loader.load('./fixtures/src/Entry.sol')
  console.log(dir)
})
