import { EventItem, AbiItem } from './types'

export interface IContractSdkBuilder {
  setName(name: string): IContractSdkBuilder
  addEvent(e: EventItem): IContractSdkBuilder
  addEvents(e: EventItem[]): IContractSdkBuilder
  addMethod(m: AbiItem): IContractSdkBuilder
  addMethods(m: AbiItem[]): IContractSdkBuilder
  build(): string
}

const tmpl = `/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import {
  CPCWallet, BigNumber, CPCJsonRpcProvider, Contract, TxResult,
  uint256, bool, address, uint64, uint8, int8
} from 'cpchain-typescript-sdk'

// eslint-disable-next-line
{{abi}}
`

const viewerTmpl = `export class {{name}}Viewer {
  provider: CPCJsonRpcProvider
  contractAddress: address
  contract: Contract
  constructor (provider: CPCJsonRpcProvider, contractAddress: address) {
    this.provider = provider
    this.contractAddress = contractAddress
    this.contract = new Contract(this.contractAddress, abi, this.provider)
  }
{{methods}}
}`

const callerTmpl = `export class {{name}}Caller {
  wallet: CPCWallet
  contractAddress: address
  contract: Contract
  constructor (wallet: CPCWallet, contractAddress: address) {
    this.wallet = wallet
    // check provider in wallet
    if (!wallet.provider) {
      throw new Error('Wallet provider is not set')
    }
    this.contractAddress = contractAddress
    this.contract = new Contract(this.contractAddress, abi, this.wallet)
  }
{{methods}}
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
    // handle inputs
    // If the method's first parameter don't have a name, this means this is a array object
    if (inputs.length > 0 && inputs[0].name === '') {
      inputs[0].name = 'i'
    }

    const params = inputs.map(i => i.name).join(', ')
    const paramsWithType = inputs.map(i => `${i.name}: ${i.type}`).join(', ')
    const txParams = '_tx: {value?: BigNumber} = {}'
    const txParamsStr = !payable ? '' : ((params ? ', ' : '') + '_tx')
    const payableStr = !payable ? '' : ((params ? ', ' : '') + txParams)
    const returns = !payable ? '[' + outputs.map(i => `${i.type}`).join(', ') + ']' : 'TxResult'
    return `
  async {{name}} ({{paramsWithType}}{{payableStr}}): Promise<{{returns}}> {
    return await this.contract.{{name}}({{params}}{{txParamsStr}})
  }`.replace(/{{name}}/g, name)
      .replace(/{{paramsWithType}}/g, paramsWithType)
      .replace(/{{params}}/g, params)
      .replace(/{{returns}}/g, returns)
      .replace(/{{payableStr}}/g, payableStr)
      .replace(/{{txParamsStr}}/g, txParamsStr)
  }

  build (): string {
    // abi
    const abiGenerated = `const abi = ${this.abi}`
    // body
    const tmplGenerated = tmpl.replace('{{abi}}', abiGenerated)
    // viewer methods
    const viewerMethods = this._methods
      .filter(m => m.stateMutability === 'view' || m.stateMutability === 'pure')
      .map(m => this.buildMethod(m, false)).join('\n')
    // caller methods
    const callerMethods = this._methods
      .filter(m => m.stateMutability === 'payable' || m.stateMutability === 'nonpayable')
      .map(m => this.buildMethod(m, true)).join('\n')

    // viewer
    const viewerGenerated = viewerTmpl.replace('{{name}}', this._name).replace('{{methods}}', viewerMethods)
    // caller
    const callerGenerated = callerTmpl.replace('{{name}}', this._name).replace('{{methods}}', callerMethods)

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
