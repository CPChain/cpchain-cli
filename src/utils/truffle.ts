/* eslint-disable @typescript-eslint/no-unused-vars */
import loader from './loader'
import path from 'path'
import logger from './logger'
import { CPCWallet } from 'cpchain-typescript-sdk/lib/src/wallets'
import cpc from 'cpchain-typescript-sdk'

interface Artifact {
  contractName: string
  abi: [],
  bytecode: string
}

class Artifacts {
  private migrationsPath: string
  constructor (migrationsPath: string) {
    this.migrationsPath = migrationsPath
  }

  require (contractPath: string) {
    // Find the contract in `build/contracts` floder
    const contractName = contractPath.split('/').pop().replace('.sol', '.json')
    const projectDir = path.dirname(path.dirname(this.migrationsPath))
    const builtContractPath = path.join(projectDir, 'build/contracts', contractName)
    if (!loader.fileExists(builtContractPath)) {
      throw new Error(`Contract file "${builtContractPath}" not found`)
    }

    return loader.readFile(builtContractPath).then(data => {
      const contractJson = JSON.parse(data)
      if (contractJson.abi === undefined || contractJson.bytecode === undefined || contractJson.contractName === undefined) {
        throw new Error('Invalid contract file: missing abi, bytecode or contractName')
      }
      return contractJson
    })
  }
}

class Deployer {
  private signer: CPCWallet
  constructor (signer: CPCWallet) {
    this.signer = signer
  }

  async deploy (contractModule: Promise<Artifact>, ...args: any[]) {
    const artifact = await contractModule
    logger.info(`Deploying ${artifact.contractName} contract...`)

    const contractFactory = new cpc.contract.ContractFactory(artifact.abi, artifact.bytecode, this.signer)
    const myContract = await contractFactory.deploy(...args)

    await myContract.deployTransaction.wait()
    logger.info(`Contract ${artifact.contractName} address is ${myContract.address}`)
  }
}

async function loadMigration (filePath: string, signer: CPCWallet) {
  const migration = await loader.readFile(filePath)
  // eslint-disable-next-line no-unused-vars
  const artifacts = new Artifacts(filePath)
  // eslint-disable-next-line no-unused-vars
  const module: { exports?: (Deployer)=>{} } = {}
  const deployer = new Deployer(signer)
  // eslint-disable-next-line no-eval
  eval(migration)
  module.exports(deployer)
}

export default {
  loadMigration
}
