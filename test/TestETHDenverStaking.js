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

// februrary 18th midnight MST
const eventIsOver = 1550469600;


contract("ETHDenverStaking", async function (accounts) {
    let owner = accounts[0];
    let staker = accounts[1];

    describe('ETHDenverStaking - Stake', () => {
        it("basic test", async function () {
            let signature = "0x68ec1c1e24898d4963357f41800fd2716ce74db0f56028e455c5a7bb27ef3ace4e3608ff34414cf1e4326c8df91a70cc56e5c8513cbbf5117d57f0b690f188b31c"
            let userAddress = "0xee7e80908d1c146495acbd40a20f35d1a9571219";
            let amountStaked = 97000000000000000;
            let expiringDate = 1537598899;

            let ethDenverStakingContract = await ETHDenverStaking.deployed();
            // prettyPrint(ethDenverStakingContract.address);
            let tx = await ethDenverStakingContract.stake(userAddress, expiringDate, signature, { from: staker, value: amountStaked });
            prettyPrint(tx);
        });

        it("sweepStake test failure", async function () {
            let ethDenverStakingContract = await ETHDenverStaking.deployed();
            let tx = await ethDenverStakingContract.sweepStakes();
            prettyPrint(tx);
        });

        it("sweepStake test success", async function () {
            var fakeEndDate = Math.round((new Date()).getTime() / 1000) - 10000;
            ethDenverStakingContract = ETHDenverStaking.new(authorizedAddress, fakeEndDate, { from: owner });
            let tx = await ethDenverStaking.sweepStakes({ from: owner });
            prettyPrint(tx);
        });

    });
});


