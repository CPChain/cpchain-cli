import { Contracts, ContractTemplate, BaseContract } from '../../types/Contracts'

export class BaseContractsBuilder implements ContractTemplate {
  private contracts: Contracts
  private tmpl: string = 'BaseTmpl'

  constructor () {
    this.reset()
  }

  public static covertContractName (name: string): string {
    // if containers -
    let split = ' '
    if (name.indexOf('-')) {
      split = '-'
    } else if (name.indexOf('_')) {
      split = '_'
    }
    const words = name.split(split)
    return words.map(w => w[0].toUpperCase() + w.slice(1)).join('')
  }

  public tmplName (): string {
    return this.tmpl
  }

  public reset () {
    this.contracts = new Contracts()
  }

  public setContractName (name: string) : BaseContractsBuilder {
    this.contracts.name = name
    return this
  }

  public addParent (parent: BaseContract) : BaseContractsBuilder {
    this.contracts.parent.push(parent)
    return this
  }

  public build (): Contracts {
    const result = this.contracts
    this.reset()
    return result
  }
}
