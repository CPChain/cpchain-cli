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

const tmpl = `/* eslint-disable camelcase */
import { CPCWallet, BigNumber } from 'cpchain-typescript-sdk'

${fieldsMapping}

export default class {{name}} {
  wallet: CPCWallet
  constructor (wallet: CPCWallet) {
    this.wallet = wallet
    // check provider in wallet
    if (!wallet.provider) {
      throw new Error('Wallet provider is not set')
    }
  }
}
`

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

  build (): string {
    // name
    const tmplGenerated = tmpl
      .replace('{{name}}', this._name)

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
    return `${tmplGenerated}\n${eventTmplGenerated}`
  }
}

export const createContractSdkBuilder = (): IContractSdkBuilder => {
  return new ContractSdkBuilder()
}
