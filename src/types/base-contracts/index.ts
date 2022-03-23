import { BaseContract } from '../Contracts'

const createBaseContract = (name: string, desc: string, modulePath: string):BaseContract => {
  return {
    name, desc, modulePath
  }
}

export default [
  createBaseContract('Claimable', 'Ownable', '@cpchain-tools/cpchain-contracts/ownership/Claimable.sol'),
  createBaseContract('Enable', 'Enable', '@cpchain-tools/cpchain-contracts/lifecycle/Enable.sol')
  // ERC20 需要额外的参数
  // createBaseContract('ERC20', 'ERC20', '@cpchain-tools/cpchain-contracts/token/ERC20/ERC20.sol')
]
