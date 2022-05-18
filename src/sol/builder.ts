import { EventItem, AbiItem } from './types'

export interface IContractSdkBuilder {
  setName(name: string): IContractSdkBuilder
  addEvent(e: EventItem): IContractSdkBuilder
  addEvents(e: EventItem[]): IContractSdkBuilder
  addMethod(m: AbiItem): IContractSdkBuilder
  addMethods(m: AbiItem[]): IContractSdkBuilder
  build(): string
}

const tmpl = `

import { CPCWallet } from 'cpchain-typescript-sdk'

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
    // camelCase
    return this._name.replace(/([A-Z])/g, '_$1').toLowerCase()
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
    const tmplGenerated = tmpl
      .replace('{{name}}', this._name)
    return tmplGenerated
  }
}

export const createContractSdkBuilder = (): IContractSdkBuilder => {
  return new ContractSdkBuilder()
}
