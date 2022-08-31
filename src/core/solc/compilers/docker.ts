import { CompileResult, SolcDockerCompiler, SolcImage } from './types'
import xfetch from 'cross-fetch'
import { execSync } from 'child_process'
import semver from 'semver'
import fs from 'fs'
import path from 'path'

const DOCKER_HUB_TAGS_URL = 'https://registry.hub.docker.com/v2/repositories/ethereum/solc/tags/?'

export class NoDockerError extends Error {
  constructor () {
    super('You are trying to run dockerized solc, but docker is not installed.')
  }
}

export class NoStringError extends Error {
  constructor (input) {
    const message =
      '`compilers.solc.version` option must be a string specifying:\n' +
      '   - a path to a locally installed solcjs\n' +
      "   - a solc version or range (ex: '0.4.22' or '^0.5.0')\n" +
      "   - a docker image name (ex: 'stable')\n" +
      "   - 'native' to use natively installed solc\n" +
      'Received: ' +
      input +
      ' instead.'
    super(message)
  }
}

interface Hooks {
  onDownloadStarted?: () => void
  onDownloadSuccess?: () => void
}

interface SolcDockerCompilerImplProps {
  tag?: string
  hooks?: Hooks
}

class SolcDockerCompilerImpl implements SolcDockerCompiler {
  tag: string = '0.4.25'
  supportedTags = ['0.4.24', '0.4.25']
  commandPrefix: string
  hooks: Hooks

  constructor ({ tag, hooks }: SolcDockerCompilerImplProps) {
    this.tag = tag || this.tag
    this.hooks = hooks
    if (!this.supportedTags.includes(this.tag)) {
      throw new Error(`Only support those images: ${this.supportedTags.join(', ')}`)
    }
    this.checkIfLocalAlreadyExists(this.tag)
  }

  compile (entry: string) {
    if (!fs.existsSync(entry)) {
      throw new Error(`${entry} not found`)
    }
    if (fs.statSync(entry).isDirectory()) {
      throw new Error(`${entry} is a directoy rather a file`)
    }
    if (!path.isAbsolute(entry)) {
      throw new Error(`${entry} is not an absolute path`)
    }
    if (!entry.endsWith('.sol')) {
      throw new Error(`${entry} is not a solidity file`)
    }
    const entryContractPath = entry.split('/').slice(-1)[0]
    // start a container to compile solidity
    const cmd = `docker run -i --workdir /src --rm -v ${path.dirname(entry)}:/src ethereum/solc:${this.tag} --bin --abi ${entryContractPath}`
    const result = execSync(cmd)
    const regex = /=======\s([a-zA-Z0-9_]+\.sol):([a-zA-Z0-9_]+)\s=======\s+Binary:\s+([0-9a-z]+)\s+Contract JSON ABI\s+(.*)\s+/g
    let tmpContracts
    const contracts: CompileResult[] = []
    while ((tmpContracts = regex.exec(result.toString())) !== null) {
      const [contractFile, contractName, bytecode, abi] = tmpContracts.filter((_, i) => i > 0)
      contracts.push({ contractFile, contractName, bytecode, abi })
    }
    if (contracts.length > 0) {
      contracts.slice(-1)[0].isEntry = true
    }
    return contracts
  }

  async checkIfLocalAlreadyExists (tag: string) {
    // Docker exists locally
    try {
      execSync('docker -v')
    } catch (error) {
      throw new NoDockerError()
    }
    // Image exists locally
    try {
      execSync('docker inspect --type=image ethereum/solc:' + tag)
    } catch (error) {
      console.log(`${tag} does not exist locally.\n`)
      console.log('Attempting to download the Docker image.')
      this.downloadDockerImage(tag)
    }
  }

  downloadDockerImage (image: string) {
    if (!semver.valid(semver.coerce(image))) {
      const message =
        'The image version you have provided is not valid.\n' +
        `Please ensure that ${image} is a valid docker image name.`
      throw new Error(message)
    }
    try {
      this.hooks?.onDownloadStarted && this.hooks.onDownloadStarted()
      execSync(`docker pull ethereum/solc:${image}`)
      this.hooks?.onDownloadSuccess && this.hooks.onDownloadSuccess()
    } catch (err) {
      console.error(err)
    }
  }

  async list (page?: number): Promise<SolcImage[]> {
    const res = await xfetch(DOCKER_HUB_TAGS_URL + new URLSearchParams({ page: page ? '' + page : '1' }))
    const data = await res.json()
    return (data.results as any[]).map(i => {
      return {
        name: i.name,
        images: i.images
      }
    })
  }
}

export const createSolcDockerCompiler = ({ hooks }: { hooks?: Hooks}): SolcDockerCompiler => {
  return new SolcDockerCompilerImpl({ hooks })
}
