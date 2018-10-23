# ethdenver-staking-contracts

Contracts to manage the staking for the ETHDenver applications

The main flow of the contract interaction is:

    - Allow a user to stake
    - Allow a user to recoup their stake

Look forward to seeing you at ETHDenver!  
Coury Ditch, Joao Aguiam, and the rest of the ETHDenver Team!

## The grant and grantSigner

We are using a webserver to grant access to staking and recouping using this "grant" functionality.  

In other words, we only allow a user to stake or recoup if the server has signed off on it.

The contract is aware of what signing key the server has via `address public grantSigner`

The grant (signed msg from the server) includes: The user's uport address, the stake amount, and the expiry date.
All of this information is provided to the function call `stake((address _userUportAddress, uint _expiryDate, bytes _signature)` as well.

To verify that all the data provided to the function is unaltered, and equals the data in the message signed by the server, we hash the data (`toEthSignedMessageHash`), and recovery the signed data provided by the server (`.recover(_signature)`). This will fail if anything has been altered (see tests for proof).

A similar process is used for recouping a stake. See [here](https://openzeppelin.org/api/docs/ECRecovery.html) for more info on how the ECRecovery library works.

## Recouping / Proving Attendance at ETHDenver

Upon staking, we track the `msg.sender` and map it back to the the user's uPort address (provided by the server), as well as track the amount they staked, so it can be easily returned.

This way, upon arrival at ETHDenver, when the user proves their attendance, no interaction with metamask is required, they only need to prove their identity with uPort, and the funds will be automatically sent back to the original Metmask.

## Owner functionality

Only the `owner` should be able to:

    - change the `grantSigner` address
    - Sweep the un-recouped stakes (people who didn't prove attendance) after the event `finishDate` is passed.

## Misc

The contract implements Pausable. This will stop `stake` and `recoup`, but not `setGrantSigner` or `sweetStakes`.
SafeMath, Ownable, and ECRecovery libraries are also used, taken from open-zepplin.

