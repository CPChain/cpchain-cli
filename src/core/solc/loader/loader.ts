import { Loader } from './types'
import fs from 'fs'
import path from 'path'

const NODE_MODULES = 'node_modules'
const DEFAULT_CACHE_DIR = '.cpchain-cache'

const isFileNotFound = (err: Error) => {
  return err && err.message && err.message.startsWith('ENOENT: no such file or directory,')
}

interface LoadResult {
  absPath: string
  code: string
}

const loadFile = (file: string): LoadResult => {
  let s: Buffer
  let absPath = ''
  const curDir = process.cwd()
  const parentDir = path.dirname(curDir)
  const curNodeModules = path.join(curDir, NODE_MODULES)
  const parentNodeModules = path.join(parentDir, NODE_MODULES)
  if (path.isAbsolute(file)) {
    // 如果文件直接是绝对路径
    absPath = file
  } else {
    // 如果文件是相对路径，且存在
    if (fs.existsSync(file)) {
      absPath = path.join(curDir, file)
    } else {
      // 如果文件相对路径不存在
      // 检查当前目录是否存在 node_modules
      if (fs.existsSync(curNodeModules)) {
        const tmpPath = path.join(curNodeModules, file)
        if (fs.existsSync(tmpPath)) {
          absPath = tmpPath
        }
      } else if (fs.existsSync(parentNodeModules)) {
        // 检查父级目录是否存在 node_modules
        const tmpPath = path.join(parentNodeModules, file)
        if (fs.existsSync(tmpPath)) {
          absPath = tmpPath
        }
      } else {
        throw new Error(`${file} not exists in ${process.cwd()}`)
      }
    }
  }
  try {
    s = fs.readFileSync(absPath)
  } catch (err) {
    if (isFileNotFound(err)) {
      throw new Error(`Don't find contract ${file}`)
    } else {
      throw err
    }
  }
  return {
    code: s.toString(),
    absPath
  }
}

interface ImportedContract {
  raw: string
  filePath: string
  name: string
}

const parseImportedContracts = (entry: string) => {
  const regex = /import "(.+)"/g
  const it = entry.match(regex)
  if (!it) {
    return []
  }
  return it.map(r => {
    let filePath = r.split(' ')[1]
    filePath = filePath.substring(1, filePath.length - 1)
    const name = filePath.split('/').slice(-1)[0]
    return {
      raw: r,
      filePath,
      name
    } as ImportedContract
  })
}

interface Contract {
  name: string
  code: string
}

class LoaderImpl implements Loader {
  private loadAndParseContract (contractPath: string) {
    const name = contractPath.split('/').splice(-1)[0]
    const contracts: Contract[] = []
    let { code, absPath } = loadFile(contractPath)
    const dirNow = path.dirname(absPath)
    const currentDir = process.cwd()
    process.chdir(dirNow)
    // parse all imports
    const importedContracts = parseImportedContracts(code)
    // replace raw import with flat import sytax
    importedContracts.forEach(i => {
      // parse contract recursively
      const subContracts = this.loadAndParseContract(i.filePath)
      contracts.push(...subContracts)
      code = code.replace(i.raw, `import "./${i.name}"`)
    })
    // change directory back
    process.chdir(currentDir)
    contracts.push({ code, name })
    return contracts
  }

  load (entryContractPath: string): string {
    const contracts = this.loadAndParseContract(entryContractPath)
    // store all contracts in a directory
    const cacheDir = DEFAULT_CACHE_DIR
    this.clean(cacheDir)
    fs.mkdirSync(cacheDir)
    contracts.forEach(i => {
      fs.writeFileSync(path.join(cacheDir, i.name), i.code)
    })
    return cacheDir
  }

  clean (dir: string) {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  }
}

export const createLoader = (): Loader => {
  return new LoaderImpl()
}
