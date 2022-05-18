/* eslint-disable @typescript-eslint/no-unused-vars */
import loader from './loader'
import path from 'path'
import logger from './logger'
import cpc, { CPCWallet } from 'cpchain-typescript-sdk'

interface Artifact {
  contractName: string
  abi: [],
  bytecode: string
  address: string
  deployed: () => {}
}

class Deployer {
  private signer: CPCWallet
  constructor (signer: CPCWallet) {
    this.signer = signer
  }

  async deploy (artifact: Artifact, ...args: any[]): Promise<any> {
    logger.info(`Deploying ${artifact.contractName} contract...`)

    const contractFactory = new cpc.contract.ContractFactory(artifact.abi, artifact.bytecode, this.signer)
    const myContract = await contractFactory.deploy(...args)

    await myContract.deployTransaction.wait()
    logger.info(`Contract ${artifact.contractName} address is ${myContract.address}`)
    artifact.address = myContract.address
    return myContract
  }
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
    const data = loader.readFileSync(builtContractPath)
    const contractJson: Artifact = JSON.parse(data)
    if (contractJson.abi === undefined || contractJson.bytecode === undefined || contractJson.contractName === undefined) {
      throw new Error('Invalid contract file: missing abi, bytecode or contractName')
    }
    contractJson.deployed = async () => {
      return contractJson
    }
    return contractJson
  }
}

async function loadMigration (filePath: string, signer: CPCWallet) {
  const migration = await loader.readFile(filePath)
  const deployer = new Deployer(signer)
  // eslint-disable-next-line no-unused-vars
  const artifacts = new Artifacts(filePath)
  // eslint-disable-next-line no-unused-vars
  const module: { exports?: (Deployer)=>{} } = {}
  // eslint-disable-next-line no-eval
  eval(migration)
  module.exports(deployer)
}

export default {
  loadMigration
}
