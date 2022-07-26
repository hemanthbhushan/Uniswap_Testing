//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

import "../UniswapV2ERC20.sol";

abstract contract ERC20 is UniswapV2ERC20 {
    constructor(uint _totalSupply)  {
        _mint(msg.sender, _totalSupply);
    }
}
