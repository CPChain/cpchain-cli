# CPChain CLI Tools

This tool aim to help developer develop smart contract on CPChain mainnet.

## Usage

```bash

npm install -g cpchain-cli

cpchain-cli help

cpchain-cli generate -n MyContract

cd MyContract

# Test contract
truffle test

```

## Deploy on Testnet

Before deploying contract on the mainnet, we suggest developers the smart contracts on [Testnet](https://testnet.cpchain.io/#/) first to secure test. You can get Test CPC coins by the [faucet](https://testnet.cpchain.io/#/faucet). This faucet drips 100 CPC every 10 seconds. You can register your account in our queue.

### Create account

```bash

# install tools
pip3 install cpc-fusion

# create a new account
cpc-fusion account create

```

### Deploy

Now, copy your address and access [faucet](https://testnet.cpchain.io/#/faucet) to get test coins. Then build your contract and deploy it on Testnet:

```bash

# build contracts
npm run build

# deploy on testnet (Specify your keystore)
cpc-fusion deploy --keystore <The path of your keystore>  --abi build/contracts/MyContract.json --endpoint https://civilian.testnet.cpchain.io --chainID 41


```

### Manage Contract by Command-Line

After deploying your contract, you will need to manage it. The cpc-fusion can also support managing deployed contract. Please run as below to get all commands:

```bash

cpc-fusion -h

```

If you want to check all configurations, you can use `cpc-fusion get-configs -h`, for example:

```bash

cpc-fusion get-configs --abi build/contracts/HelloWorld.json --address <contract address>

```

If you want to call your contract, you can use `cpc-fusion call-func -h`, for example:

```bash

cpc-fusion call-func --keystore <keystore/key> --address <contract address> --abi build/contracts/HelloWorld.json --function <function name> --parameters <parameters>

```

Add you can add `--value` to specify the amount of `CPC`.

If you want to call `view` function to check something, you can use `cpc-fusion view-func -h`, for example:

```bash

cpc-fusion view-func --abi build/contracts/HelloWorld.json --address <contract address> --function <function name> --parameters <parameters>

```

## Deploy on Mainnet

```bash

# deploy on the Mainnet (Specify your keystore)
cpc-fusion deploy --keystore <The path of your keystore>  --abi build/contracts/MyContract.json

```

## Develop

```bash

npm i

npm link

ts-node src/index.ts -h

# publish
# npm publish

```

## References

+ [SWC](https://swc.rs/docs/getting-started)
