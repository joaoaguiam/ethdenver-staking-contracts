pragma solidity ^0.4.25;

import "../node_modules/zeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";
import "../node_modules/zeppelin-solidity/contracts/ECRecovery.sol";


contract ETHDenverStaking is Ownable, Pausable {

    using ECRecovery for bytes32;

    event UserStake(address userUportAddress, address userMetamaskAddress, uint amountStaked);
    event UserRecoupStake(address userUportAddress, address userMetamaskAddress, uint amountStaked);

    // Debug events
    event debugBytes32(bytes32 _msg);
    event debugBytes(bytes _msg);
    event debugString(string _msg);
    event debugAddress(address _address);

    // ETHDenver will need to authorize staking and recouping.
    address public grantSigner;

    // End of the event, when staking can be sweeped
    uint public finishDate;

    // uPortAddress => walletAddress
    mapping (address => address) public userStakedAddress;

    // ETH amount staked by a given uPort address
    mapping (address => uint) public stakedAmount;


    constructor(address _grantSigner, uint _finishDate) public {
        require(_grantSigner != address(0x0));
        require(_finishDate > block.timestamp);
        grantSigner = _grantSigner;
        finishDate = _finishDate;
    }

    // Public functions

    // function allow the staking for a participant
    function stake(address _userUportAddress, uint _expiryDate, bytes _signature) public payable whenNotPaused {
        bytes32 hashMessage = keccak256(abi.encodePacked(_userUportAddress, msg.value, _expiryDate));
        address signer = hashMessage.toEthSignedMessageHash().recover(_signature);

        require(signer == grantSigner, "Signature is not valid");
        require(block.timestamp < _expiryDate, "Grant is expired");
        require(userStakedAddress[_userUportAddress] == 0, "User has already staked!");

        userStakedAddress[_userUportAddress] = msg.sender;
        stakedAmount[_userUportAddress] = msg.value;

        emit UserStake(_userUportAddress, msg.sender, msg.value);
    }

    // function allow the staking for a participant
    function recoupStake(address _userUportAddress, uint _expiryDate, bytes _signature) public whenNotPaused {
        bytes32 hashMessage = keccak256(abi.encodePacked(_userUportAddress, _expiryDate));
        address signer = hashMessage.toEthSignedMessageHash().recover(_signature);

        require(signer == grantSigner, "Signature is not valid");
        require(block.timestamp < _expiryDate, "Grant is expired");
        require(userStakedAddress[_userUportAddress] != 0, "User has not staked!");

        address stakedBy = userStakedAddress[_userUportAddress];
        uint amount = stakedAmount[_userUportAddress];
        userStakedAddress[_userUportAddress] = address(0x0);
        stakedAmount[_userUportAddress] = 0;

        stakedBy.transfer(amount);

        emit UserRecoupStake(_userUportAddress, stakedBy, amount);
    }

    // Owner functions

    function setGrantSigner(address _signer) public onlyOwner {
        require(_signer != address(0x0), "address is null");
        grantSigner = _signer;
    }

    function sweepStakes() public onlyOwner {
        require(block.timestamp > finishDate, "EthDenver is not over yet!");
        owner.transfer(address(this).balance);
    }

}