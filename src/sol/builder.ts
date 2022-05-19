import { EventItem, AbiItem } from './types'

export interface IContractSdkBuilder {
  setName(name: string): IContractSdkBuilder
  addEvent(e: EventItem): IContractSdkBuilder
  addEvents(e: EventItem[]): IContractSdkBuilder
  addMethod(m: AbiItem): IContractSdkBuilder
  addMethods(m: AbiItem[]): IContractSdkBuilder
  build(): string
}

const fieldsMapping = `export type uint256 = BigNumber
export type bool = boolean
export type address = string
export type uint64 = number
export type uint8 = number
export type int8 = number`

const tmpl = `/* eslint-disable */
import cpc, { CPCWallet, BigNumber, CPCJsonRpcProvider, Contract } from 'cpchain-typescript-sdk'

{{abi}}

${fieldsMapping}
`

const viewerTmpl = `export class {{name}}Viewer {
  provider: CPCJsonRpcProvider
  contractAddress: address
  contract: Contract
  constructor (provider: CPCJsonRpcProvider, contractAddress: address) {
    this.provider = provider
    this.contractAddress = contractAddress
    this.contract = new Contract(this.contractAddress, abi)
  }
{{methods}}
}`

const callerTmpl = `export class {{name}}Caller {
  wallet: CPCWallet
  constructor (wallet: CPCWallet) {
    this.wallet = wallet
    // check provider in wallet
    if (!wallet.provider) {
      throw new Error('Wallet provider is not set')
    }
  }
}`

export class ContractSdkBuilder implements IContractSdkBuilder {
  private _name: string
  private _events: EventItem[]
  private _methods: AbiItem[]

  constructor () {
    this._name = ''
    this._events = []
    this._methods = []
  }

  get name (): string {
    return this._name
  }

  get events (): EventItem[] {
    return this._events
  }

  get methods (): AbiItem[] {
    return this._methods
  }

  get abi (): string {
    return JSON.stringify(this._methods)
  }

  setName (name: string): IContractSdkBuilder {
    this._name = name
    return this
  }

  addEvent (e: EventItem): IContractSdkBuilder {
    this._events.push(e)
    return this
  }

  addEvents (e: EventItem[]): IContractSdkBuilder {
    this._events.push(...e)
    return this
  }

  addMethod (m: AbiItem): IContractSdkBuilder {
    this._methods.push(m)
    return this
  }

  addMethods (m: AbiItem[]): IContractSdkBuilder {
    this._methods.push(...m)
    return this
  }

  buildMethod (m: AbiItem, payable: boolean): string {
    const { name, inputs, outputs } = m
    console.log(name, inputs)
    const params = inputs.map(i => i.name).join(', ')
    const paramsWithType = inputs.map(i => `${i.name}: ${i.type}`).join(', ')
    const payableStr = !payable ? '' : ((params ? ', ' : '') + '_amount: BigNumber')
    const returns = outputs.map(i => `${i.name}: ${i.type}`).join(', ')
    return `
  async {{name}} ({{paramsWithType}}{{payableStr}}): Promise<any> {
    return await this.contract.{{name}}({{params}})
  }`.replace(/{{name}}/g, name)
      .replace(/{{paramsWithType}}/g, paramsWithType)
      .replace(/{{params}}/g, params)
      .replace('{{returns}}', returns)
      .replace(/{{payableStr}}/g, payableStr)
  }

  build (): string {
    // abi
    const abiGenerated = `const abi = ${this.abi}`
    // body
    const tmplGenerated = tmpl.replace('{{abi}}', abiGenerated)
    // methods
    const viewerMethods = this._methods
      .filter(m => m.stateMutability === 'view' || m.stateMutability === 'pure')
      .filter(m => m.inputs.length > 0)
      .filter(m => m.inputs[0].name.length > 0)
      .map(m => this.buildMethod(m, false)).join('\n')

    // viewer
    const viewerGenerated = viewerTmpl.replace('{{name}}', this._name).replace('{{methods}}', viewerMethods)
    // caller
    const callerGenerated = callerTmpl.replace('{{name}}', this._name)

    // Event
    const eventTmpl = `export interface {{name}} {
{{fields}}
}
`
    const eventTmplGenerated = this._events.map(e => {
      const fields = e.inputs.map(i => {
        return `  ${i.name}: ${i.type}`
      }).join(',\n')
      return eventTmpl
        .replace('{{name}}', e.name)
        .replace('{{fields}}', fields)
    }).join('\n')
    return `${tmplGenerated}\n${eventTmplGenerated}\n${viewerGenerated}\n\n${callerGenerated}\n`
  }
}

export const createContractSdkBuilder = (): IContractSdkBuilder => {
  return new ContractSdkBuilder()
}
