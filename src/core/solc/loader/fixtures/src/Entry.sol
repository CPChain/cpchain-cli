pragma solidity ^0.4.24;
import "../lib/SafeMath.sol";
import "../lib/Ownable.sol";
import "@cpchain-tools/cpchain-utils/Hello.sol";

contract Entry is Hello {
    using SafeMath for uint256;

    constructor()
        public
    {}

    function sayHello () public pure returns (string) {
      return "Hello world";
    }
}
