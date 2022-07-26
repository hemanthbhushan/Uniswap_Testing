// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenB is ERC20 {
    constructor() ERC20("TokenB", "TB") {
        _mint(msg.sender, 1000000 * 10**18);
    }

    function mintToken(address to, uint256 amount) public {
        _mint(to, amount);
    }
}