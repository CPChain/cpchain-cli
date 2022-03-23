import { BaseContract } from '../Contracts'

const createBaseContract = (name: string, desc: string):BaseContract => {
  return {
    name, desc
  }
}

export default [
  createBaseContract('Claimable', 'Ownable'),
  createBaseContract('Enable', 'Enable')
]
