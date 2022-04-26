import { loadConfig } from '../src/configs'

describe('Config', () => {
  it('should be defined', () => {
    expect(loadConfig).toBeDefined()
    const cgf = loadConfig('./cpchain-cli.default.toml')
    expect(cgf).toBeDefined()
    expect(cgf.chain.chainID).toBe(41)
    expect(cgf.chain.endpoint).toBe('https://civilian.testnet.cpchain.io')
  })
})
