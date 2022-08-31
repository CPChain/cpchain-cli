
export type SolcImage = {
  images: any
  name: string
}

export interface CompileResult {
  contractFile: string
  contractName: string
  abi: string
  bytecode: string
  isEntry?: boolean
}

export interface Compiler {
  compile(entry: string): CompileResult[]
}

export interface SolcDockerCompiler extends Compiler {
  list(page?: number): Promise<SolcImage[]>
}
