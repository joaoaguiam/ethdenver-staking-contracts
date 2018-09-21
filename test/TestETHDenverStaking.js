var ETHDenverStaking = artifacts.require("ETHDenverStaking");

const prettyPrint = obj => console.log(JSON.stringify(obj, null, 2));


let toAscii = function (str) {
    return web3.toAscii(str).replace(/\u0000/g, '');
}

let getEvent = function (logs, eventName) {
    let size = logs.length;
    for (i = 0; i < size; i++) {
        if (logs[i].event == eventName) {
            return logs[i];
        }
    }
}

let countEvents = function (logs, eventName) {
    let size = logs.length;
    let count = 0;
    for (i = 0; i < size; i++) {
        if (logs[i].event == eventName) {
            count++;
        }
    }
    return count;
}

let isEVMException = function (err) {
    return err.toString().includes('revert');
}

const authorizedAddress = "0xc1E19BDD3DBBA6c070579083E3B0D4C92fcaE0B3";

contract("ETHDenverStaking", async function (accounts) {



    describe('ETHDenverStaking - Stake', () => {
        let contract;
        /*beforeEach(async function() {
          contract = await
        })*/
        it("basic test", async function () {
            let owner = accounts[0];
            let signature = "0xc940808d99c8cbb1d62fa02cc22164e0c42b153ba45cf6a9fcd259b8eabf85b64d477fa5173a8f31a4f7b999f274440a213e67f4af9c43730c6a4ccf49ce2df01b"
            let userAddress = "0xee7e80908d1c146495acbd40a20f35d1a9571219";
            let amountStaked = 97000000000000000;
            let expiringDate = 1537598371;

            let ethDenverStakingContract = await ETHDenverStaking.deployed();
            // prettyPrint(ethDenverStakingContract.address);
            let tx = await ethDenverStakingContract.stake(userAddress, expiringDate, signature, { from: accounts[0], value: amountStaked });
            prettyPrint(tx);

        });

    });
});
