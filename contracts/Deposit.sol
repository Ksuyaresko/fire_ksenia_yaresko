// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Deposit {
    IERC20 public token;
    address private _owner;

    event Deposit(address sender, uint amount);
    event Withdraw(address sender, uint amount);

    mapping(address => uint256) public deposits;

    constructor(IERC20 token_) {
        token = token_;
        _owner = msg.sender;
    }

    function deposit(uint256 amount) public {
        token.transferFrom(msg.sender, address(this), amount);
        deposits[msg.sender] += amount;
        emit Deposit(msg.sender, amount);
    }
    function availableToWithdraw() public view returns (uint256) {
        return deposits[msg.sender];
    }
    function withdraw(uint amount) public {
        require(deposits[msg.sender] >= amount);
        deposits[msg.sender] -= amount;
        token.transfer(msg.sender, amount);
        emit Withdraw(msg.sender, amount);
    }
    function depositOwner(uint256 amount) public {
        require(msg.sender == _owner, "You are not the owner.");
        token.transferFrom(msg.sender, address(this), amount);
    }
    function withdrawOwner(uint amount) public {
        require(msg.sender == _owner, "You are not the owner.");
        token.transfer(msg.sender, amount);
    }
}