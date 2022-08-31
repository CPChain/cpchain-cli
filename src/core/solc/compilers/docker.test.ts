import { createSolcDockerService } from './docker'

test('Test Solc docker', async () => {
  const solcSrv = createSolcDockerService({
    hooks: {
      onDownloadStarted () {
        console.log('Download started')
      },
      onDownloadSuccess () {
        console.log('Download success')
      }
    }
  })
  const data = await solcSrv.list()
  console.log(data[0].images)
}, 100000)
