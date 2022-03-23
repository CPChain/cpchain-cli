import * as fs from 'fs'

export interface BaseContract {
  name: string;
  desc: string;
}

export class Contracts {
  name: string;
  parent: BaseContract[];

  constructor () {
    this.parent = []
  }

  public writeTo (dir: string) {
    const contractsDir = `${dir}/contracts`
    fs.mkdirSync(contractsDir)

    const migrationsPath = `${contractsDir}/Migrations.sol`
    const migrations = `// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Migrations {
    address public owner = msg.sender;
    uint public last_completed_migration;

    modifier restricted() {
    require(
        msg.sender == owner,
        "This function is restricted to the contract's owner"
    );
    _;
    }

    function setCompleted(uint completed) public restricted {
    last_completed_migration = completed;
    }
}
`
    const name = this.name

    const examplePath = `${contractsDir}/${name}.sol`
    const exampleContract = `pragma solidity ^0.4.24;

contract ${name} {
    address owner; // owner has permissions to modify parameters
    constructor() public {
        owner = msg.sender;
    }

    function greet() public pure returns (string) {
        return "Hello, world";
    }
}
`
    fs.writeFileSync(migrationsPath, migrations)
    fs.writeFileSync(examplePath, exampleContract)

    // migrations
    const migrationsDir = `${dir}/migrations`
    fs.mkdirSync(migrationsDir)

    const initialMigrationPath = `${migrationsDir}/1_initial_migration.js`
    const initialMigration = `const Migrations = artifacts.require("Migrations");

module.exports = function (deployer) {
    deployer.deploy(Migrations);
};
`
    fs.writeFileSync(initialMigrationPath, initialMigration)

    const deployMigrationPath = `${migrationsDir}/2_deploy_contracts.js`
    const deployContracts = `// Deploy ${name}
var ${name} = artifacts.require("./${name}.sol");

module.exports = function(deployer) {
        deployer.deploy(${name}); //"参数在第二个变量携带"
};
`
    fs.writeFileSync(deployMigrationPath, deployContracts)

    // test
    const testDir = `${dir}/test`
    fs.mkdirSync(testDir)

    const gitkeep = `${testDir}/.gitkeep`
    fs.writeFileSync(gitkeep, '')

    const testPath = `${testDir}/Test${name}.js`
    const test = `const ${name} = artifacts.require("${name}");

contract("${name}", (accounts) => {
    it("Greet", async () => {
    const instance = await ${name}.deployed()
    const text = await instance.greet()
    console.log(text)
    })
})
`
    fs.writeFileSync(testPath, test)
  }
}

export interface ContractTemplate {
  tmplName(): string;
  build(): Contracts;
}
