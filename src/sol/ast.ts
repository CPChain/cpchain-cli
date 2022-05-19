
export type AstNodeType = 'SourceUnit' | 'PragmaDirective' | 'ImportDirective' | 'ContractDefinition' |
  'FunctionDefinition' | 'StructDefinition' | 'VariableDeclaration' | 'ElementaryTypeName'

export type AstTypeDescriptions = {
  typeIdentifier: string
  typeString: string
}

export type AstNode = {
  id: number,
  nodeType: AstNodeType,
  literals?: string[],
  src: string,
  absolutePath?: string,
  file?: string
  scope?: number
  sourceUnit?: number
  symbolAliases?: any[]
  unitAlias?: string
  baseContracts?: any[]
  contractDependencies?: any[]
  contractKind?: string
  documentation?: string
  fullyImplemented?: boolean
  linearizedBaseContracts?: number[]
  nodes?: AstNode[]
  name?: string
  members?: AstNode[]
  typeDescriptions?: AstTypeDescriptions
  typeName?: AstNode
  value?: any
  visibility?: string
  stateVariable?: boolean
}

export type AstNodes = AstNode[]

// AST tree compiled by solidity
export interface Ast {
  absolutePath: string
  exportedSymbols: any
  id: number
  nodeType: AstNodeType
  nodes: AstNodes
  src: string
}
