pragma solidity ^0.4.24;

import "../node_modules/zeppelin-solidity/contracts/lifecycle/Pausable.sol";

import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";
import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";


contract ETHDenverStaking is Ownable, Pausable {
  
    using SafeMath for uint256;

    event UserStake(address userAddress, address stakedBy, uint amountStaked);


    function testEvent(address _userAddress, address _stakedBy, uint _amountStaked) public {
        emit UserStake(_userAddress, _stakedBy, _amountStaked);
    }
    
}