
import * as fs from "fs"

export class GenerateConfig {
    name: string
}

function generateConfig(dir: string) {
    const config_path = `${dir}/truffle-config.js`
    const config = `/**
* Use this file to configure your truffle project. It's seeded with some
* common settings for different networks and features like migrations,
* compilation and testing. Uncomment the ones you need or modify
* them to suit your project as necessary.
*
* More information about configuration can be found at:
*
* trufflesuite.com/docs/advanced/configuration
*/

// const HDWalletProvider = require('@truffle/hdwallet-provider');
// const infuraKey = "fj4jll3k.....";
//
// const fs = require('fs');
// const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
    // Configure your compilers
    compilers: {
        solc: {
            version: "0.4.25",    // Fetch exact version from solc-bin (default: truffle's version)
            docker: true,         // Use "0.5.1" you've installed locally with docker (default: false)
            // settings: {          // See the solidity docs for advice about optimization and evmVersion
            //  optimizer: {
            //    enabled: false,
            //    runs: 200
            //  },
            //  evmVersion: "byzantium"
            // }
        }
    },

    // Truffle DB is currently disabled by default; to enable it, change enabled: false to enabled: true
    //
    // Note: if you migrated your contracts prior to enabling this field in your Truffle project and want
    // those previously migrated contracts available in the .db directory, you will need to run the following:
    // $ truffle migrate --reset --compile-all

    db: {
        enabled: false
    },

    plugins: ["solidity-coverage"]
};
`
    fs.writeFileSync(config_path, config)
}

function generateContracts(dir: string, name: string) {
    const contracts_dir = `${dir}/contracts`
    fs.mkdirSync(contracts_dir)

    const migrations_path = `${contracts_dir}/Migrations.sol`
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
    name = name[0].toUpperCase() + name.substr(1)
    const example_path = `${contracts_dir}/${name}.sol`
    const example_contract = `pragma solidity ^0.4.24;

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
    fs.writeFileSync(migrations_path, migrations)
    fs.writeFileSync(example_path, example_contract)

    // migrations
    const migrations_dir = `${dir}/migrations`
    fs.mkdirSync(migrations_dir)

    const initial_migration_path = `${migrations_dir}/1_initial_migration.js`
    const initial_migration = `const Migrations = artifacts.require("Migrations");

module.exports = function (deployer) {
    deployer.deploy(Migrations);
};
`
    fs.writeFileSync(initial_migration_path, initial_migration)

    const deploy_migration_path = `${migrations_dir}/2_deploy_contracts.js`
    const deploy_contracts = `// Deploy ${name}
var ${name} = artifacts.require("./${name}.sol");

module.exports = function(deployer) {
        deployer.deploy(${name}); //"参数在第二个变量携带"
};
`
    fs.writeFileSync(deploy_migration_path, deploy_contracts)

    // test
    const test_dir = `${dir}/test`
    fs.mkdirSync(test_dir)

    const gitkeep = `${test_dir}/.gitkeep`
    fs.writeFileSync(gitkeep, "")

    const test_path = `${test_dir}/Test${name}.js`
    const test = `const ${name} = artifacts.require("${name}");

contract("${name}", (accounts) => {
    it("Greet", async () => {
    const instance = await ${name}.deployed()
    const text = await instance.greet()
    console.log(text)
    })
})
`
    fs.writeFileSync(test_path, test)
}

function generatePackageJson(dir: string) {
    const path = `${dir}/package.json`
    const package_json = `{
    "scripts": {
        "build": "truffle build",
        "test": "truffle test",
        "test:coverage": "truffle run coverage"
    },
    "dependencies": {
        "solidity-coverage": "^0.7.16",
        "truffle": "^5.3.2",
        "truffle-assertions": "^0.9.2",
        "web3": "^1.3.5"
    }
}
`
    fs.writeFileSync(path, package_json)
}

function generateREADME(dir: string, name: string) {
    name = name[0].toUpperCase() + name.substr(1)
    const path = `${dir}/README.md`
    const readme = `# ${name} Contract

## Setup

\`\`\`bash

npm install

# test
truffle test


\`\`\`
`
    fs.writeFileSync(path, readme)
}

export function generate(config: GenerateConfig) {
    // generate dirs
    const dir = config.name
    if (fs.existsSync(dir)) {
        const results = fs.readdirSync(dir)
        if (results.length > 0) {
            throw new Error(`The directory ${dir} is not empty`)
        }
    } else {
        fs.mkdirSync(dir)
    }

    generateConfig(dir)
    generateContracts(dir, config.name)
    generatePackageJson(dir)
    generateREADME(dir, config.name)

}
