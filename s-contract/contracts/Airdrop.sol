// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract Airdrop {

    IERC20 public airdropToken;
    uint256 public totalTokenClaimed;

    mapping (address => bool) private isClaimed;
    uint256 public constant TOKENS_PER_CLAIM = 50 * 10**18;

    event AirdropClaimed(address user);

    constructor(address _airdropToken) public {
        require(_airdropToken != address(0));
        airdropToken = IERC20(_airdropToken);
    }

    function checkIsClaim(address user) external view returns(bool){
        return isClaimed[user];
    }

    function claimToken() public {
        address user = msg.sender;
        require(!isClaimed[user], "Already claimed!");
        isClaimed[msg.sender] = true;
        
        bool status = airdropToken.transfer(user, TOKENS_PER_CLAIM);
        require(status, "Token transfer false.");

        totalTokenClaimed = totalTokenClaimed + TOKENS_PER_CLAIM;
        emit AirdropClaimed(user);
    }
}