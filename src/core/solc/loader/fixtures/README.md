# Fixtures for Loader Test

Mock a project for testing.

if you compile `src/Entry.sol` directly you will get an error: `src/Entry.sol:2:1: Error: Source "lib/SafeMath.sol" not found: File outside of allowed directories. import "../lib/SafeMath.sol";`

```bash

docker run -it --workdir /src --rm -v `pwd`:/src ethereum/solc:0.4.25 --bin src/Entry.sol

```
