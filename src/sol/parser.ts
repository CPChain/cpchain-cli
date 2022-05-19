
import { Ast, AstNode } from './ast'

export type Field = {
  name: string
  type: string
}

export type Entity = {
  name: string
  fields: Field[]
}

// Parse AST tree compiled by solidity
// Aim to:
// 1. parse entities and actions
// 2. which entities the actions can access
// 3. which attributes of entities the actions can access
// 4. which events the actions can emit
export interface IAstParser {
  Entities (): Entity[]
  Actions (): any
}

export class AstParser implements IAstParser {
  private _ast: Ast
  constructor (ast: Ast) {
    this._ast = ast
  }

  private getContractNodes (): AstNode[] {
    const contractNode = this._ast.nodes.filter(node => node.nodeType === 'ContractDefinition')[0]
    return contractNode.nodes
  }

  private listStructs (): AstNode[] {
    const structs = this.getContractNodes().filter(node => node.nodeType === 'StructDefinition')
    return structs
  }

  Entities (): Entity[] {
    const structs = this.listStructs()
    const entities: Entity[] = []
    structs.forEach(struct => {
      const fields: Field[] = []
      struct.members.forEach(node => {
        if (node.nodeType === 'VariableDeclaration') {
          const field: Field = {
            name: node.name,
            type: node.typeName.name
          }
          fields.push(field)
        }
      })
      const entity: Entity = {
        name: struct.name,
        fields
      }
      entities.push(entity)
    })
    return entities
  }

  Actions (): any {
    return null
  }
}
