// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OgamaToken is ERC20, Ownable {
    constructor() ERC20("Ogama", "OG") Ownable(msg.sender) {
        _mint(msg.sender, 1_000 * 10 ** decimals());
    }

    function mint(address user, uint256 amount) public onlyOwner {
        _mint(user, amount * 10 ** decimals());
    }
}
