import utils from '../utils'
import { Ast, AstNode } from './ast'
import { AstParser, IAstParser } from './parser'

export enum AbiItemType {
  FUNCTION = 'function',
  EVENT = 'event'
}

export enum FieldType {
  STRING = 'string',
  ADDRESS = 'address',
  UINT = 'uint',
  UINT256 = 'uint256',
  UINT64 = 'uint64',
  BOOL = 'bool',
  UINT8 = 'uint8',
  INT8 = 'int8',
}

export interface EventField {
  name: string
  type: FieldType
  indexed: boolean
}

interface BaseItem {
  name: string,
  type: AbiItemType
  inputs: any[]
}

export interface EventItem extends BaseItem {
  anonymous: boolean
  inputs: EventField[]
}

export type StateMutability = 'pure' | 'view' | 'nonpayable' | 'payable'

export interface AbiItem extends BaseItem {
  constant: boolean,
  outputs: any[],
  payable: boolean,
  stateMutability: StateMutability
}

export type ABI = (AbiItem|EventItem)[]

export interface BuiltContractData {
  contractName: string
  abi: ABI
  ast: Ast
}

export class ContractInstance {
  private data: BuiltContractData
  private _parser: IAstParser

  constructor (data: BuiltContractData) {
    this.data = data
    this._parser = new AstParser(data.ast)
  }

  get contractName () : string {
    return this.data.contractName
  }

  get abi (): ABI {
    return this.data.abi
  }

  get ast (): Ast {
    return this.data.ast
  }

  get astParser (): IAstParser {
    return this._parser
  }

  listEvents (): EventItem[] {
    const events = this.data.abi.filter(item => item.type === AbiItemType.EVENT)
    return events as EventItem[]
  }

  listMethods (): AbiItem[] {
    const methods = this.data.abi.filter(item => item.type === AbiItemType.FUNCTION)
    return methods as AbiItem[]
  }

  listAstMethods (): AstNode[] {
    const contractNode = this.data.ast.nodes.filter(node => node.nodeType === 'ContractDefinition')[0]
    const methods = contractNode.nodes.filter(item => item.nodeType === 'FunctionDefinition')
    return methods as AstNode[]
  }
}

export function loadContract (path: string): ContractInstance {
  const builtData = utils.readJsonFile(path) as BuiltContractData
  return new ContractInstance(builtData)
}
