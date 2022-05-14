import { PackageJsonBuiler } from './builder'
import { BaseContractsBuilder } from './builder/tmpls/BaseContractsBuilder'
import { BaseContract } from './types/Contracts'
import { generateEditorConfig } from './editorconfig'
import * as fs from 'fs'

export class GenerateConfig {
  name: string;
  dir: string;
  contractName: string
  needsPackages: BaseContract[]
}

function generateConfig (config: GenerateConfig) {
  const configPath = `${config.dir}/truffle-config.js`
  const configContent = `/**
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
  fs.writeFileSync(configPath, configContent)
}

function generateContracts (config: GenerateConfig) {
  new BaseContractsBuilder()
    .setContractName(config.contractName)
    .setParents(config.needsPackages)
    .build()
    .writeTo(config.dir)
}

function generatePackageJson (config: GenerateConfig) {
  const builder = new PackageJsonBuiler()
  builder
    // name
    .setName(config.name)
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
  builder.build().writeTo(config.dir)
}

function generateREADME (config: GenerateConfig) {
  const path = `${config.dir}/README.md`
  const readme = `# ${config.contractName} Contract

## Setup

\`\`\`bash

npm install

# test
truffle test


\`\`\`
`
  fs.writeFileSync(path, readme)
}

function generateGitIgnore (config: GenerateConfig) {
  const path = `${config.dir}/.gitignore`
  const gitignore = `node_modules
coverage.json
`
  fs.writeFileSync(path, gitignore)
}

export function generate (config: GenerateConfig) {
  // generate dirs
  const dir = config.dir
  if (fs.existsSync(dir)) {
    const results = fs.readdirSync(dir)
    if (results.length > 0) {
      throw new Error(`The directory ${dir} is not empty`)
    }
  } else {
    fs.mkdirSync(dir)
  }

  generateConfig(config)
  generateContracts(config)
  generatePackageJson(config)
  generateREADME(config)
  generateGitIgnore(config)
  generateEditorConfig(config)
}
