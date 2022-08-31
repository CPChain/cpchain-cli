import ganache from 'ganache'

describe('Ganache test', () => {
  it('Example', async () => {
    const options = {}
    const provider = ganache.provider(options)
    const accounts = await provider.request({ method: 'eth_accounts', params: [] })
    console.log(accounts)
  })
})
