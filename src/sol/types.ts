import utils from '../utils'

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

export interface AbiItem extends BaseItem {
  constant: boolean,
  outputs: any[],
  payable: boolean,
  stateMutability: string
}

export type ABI = (AbiItem|EventItem)[]

export interface BuiltContractData {
  name: string
  abi: ABI
}

export function loadContract (path: string): BuiltContractData {
  const builtData = utils.readJsonFile(path) as BuiltContractData
  return builtData
}
