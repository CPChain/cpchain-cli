import { PackageJsonBuiler } from './builder'
import { BaseContractsBuilder } from './builder/tmpls/BaseContractsBuilder'
import * as fs from 'fs'

export class GenerateConfig {
  name: string;
}

function generateConfig (dir: string) {
  const configPath = `${dir}/truffle-config.js`
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
  fs.writeFileSync(configPath, config)
}

function generateContracts (dir: string, name: string) {
  new BaseContractsBuilder()
    .setContractName(BaseContractsBuilder.covertContractName(name))
    .build()
    .writeTo(dir)
}

function generatePackageJson (dir: string) {
  const builder = new PackageJsonBuiler()
  builder
    // scripts
    .addScript('build', 'truffle build')
    .addScript('test', 'truffle test')
    .addScript('test:coverage', 'truffle run coverage')
    // dependencies
    .addDependencies('solidity-coverage', '0.7.16')
    .addDependencies('truffle', '^5.3.2')
    .addDependencies('truffle-assertions', '^0.9.2')
    .addDependencies('web3', '^1.3.5')
    .addDependencies('@cpchain-tools/dapps-test-helpers', '^0.0.3')
    .addDependencies('@cpchain-tools/cpchain-contracts', '^0.0.3')

  // build and write to file
  builder.build().writeTo(dir)
}

function generateREADME (dir: string, name: string) {
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

function generateGitIgnore (dir: string) {
  const path = `${dir}/.gitignore`
  const gitignore = `node_modules
coverage.json
`
  fs.writeFileSync(path, gitignore)
}

export function generate (config: GenerateConfig) {
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
  generateGitIgnore(dir)
}
