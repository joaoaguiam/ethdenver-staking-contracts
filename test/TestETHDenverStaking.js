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
            let signature = "0xbbe6499d1089a9695323a64e6df40a66700fbabbdfa845dcde22dd301afe072c5ea0a666226e550731894a61ab4b49283abe1ae60c25c556bb117312366e8eb51c"
            let userAddress = "0xee7e80908d1c146495acbd40a20f35d1a9571219";
            let amountStaked = 970000000000000000;
            let expiringDate = 1537591303;

            let ethDenverStakingContract = await ETHDenverStaking.deployed();
            // prettyPrint(ethDenverStakingContract.address);
            let tx = await ethDenverStakingContract.stake(userAddress, expiringDate, signature, { from: accounts[0], value: amountStaked });
            prettyPrint(tx);

        });

    });
});
