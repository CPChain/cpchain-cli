
export type SolcImage = {
  images: any
  name: string
}

export interface CompileResult {
  contractFile: string
  contractName: string
  abi: string
  bytecode: string
}

export interface Compiler {
  compile(entry: string): any
}

export interface SolcDockerCompiler extends Compiler {
  list(page?: number): Promise<SolcImage[]>
}
