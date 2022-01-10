# CPChain CLI Tools

This tool aim to help developer develop smart contract on CPChain mainnet.

## Usage

```bash

cpchain-cli help

cpchain-cli generate -n MyContract

cd MyContract

# Test contract
truffle test

# Deploy
npm run build

pip3 install cpc-fusion

cpc-fusion deploy --keystore <The path of your keystore>  --abi build/contracts/MyContract.json

```

## Develop

```bash

npm i

npm link

cpchain-cli -v

# publish
# npm publish

```

## References

+ [SWC](https://swc.rs/docs/getting-started)
