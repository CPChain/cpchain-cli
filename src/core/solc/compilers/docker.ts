import { SolcDockerService, SolcImage } from './types'
import xfetch from 'cross-fetch'
import { execSync } from 'child_process'
import semver from 'semver'

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

interface SolcDockerServiceImplProps {
  tag?: string
  hooks?: Hooks
}

class SolcDockerServiceImpl implements SolcDockerService {
  tag: string = '0.4.25'
  supportedTags = ['0.4.24', '0.4.25']
  commandPrefix: string
  hooks: Hooks

  constructor ({ tag, hooks }: SolcDockerServiceImplProps) {
    this.tag = tag || this.tag
    this.hooks = hooks
    if (!this.supportedTags.includes(this.tag)) {
      throw new Error(`Only support those images: ${this.supportedTags.join(', ')}`)
    }
    this.checkIfLocalAlreadyExists(this.tag)
  }

  get command () {
    return 'docker run --platform=linux/amd64 --rm -i ethereum/solc:' +
      this.tag +
      ' --bin --abi '
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

export const createSolcDockerService = ({ hooks }: { hooks?: Hooks}): SolcDockerService => {
  return new SolcDockerServiceImpl({ hooks })
}
