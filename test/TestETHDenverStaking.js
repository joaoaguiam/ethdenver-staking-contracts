var ETHDenverStaking = artifacts.require("ETHDenverStaking");

const prettyPrint = obj => console.log(JSON.stringify(obj, null, 2));
const Web3 = require('web3');
const abi = require('ethereumjs-abi')
const BN = require('bn.js')
const pify = require('pify');

const ethAsync = pify(web3.eth);


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

const assertRevert = async (promise) => {
    try {
        await promise;
    } catch (error) {
        const revertFound = error.message.search('revert') >= 0;
        assert(revertFound, `Expected "revert", got ${error} instead`);
        return;
    }
    assert.fail('Expected revert not received');
}

// februrary 18th midnight MST
const eventIsOver = 1550469600;

const generateStakeGrant = (signer, userAddress, validity = 60 * 60 * 24, amountStake = 97000000000000000) => {
    try {
        const expiringDate = Math.round((new Date()).getTime() / 1000) + validity;
        var messageHash = "0x" + abi.soliditySHA3(
            ["address", "uint", "uint"],
            [new BN(userAddress.substr(2), 16), new BN(String(amountStake), 10), new BN(String(expiringDate), 10)]
        ).toString("hex");
        let signature = web3.eth.sign(signer, messageHash);
        return {
            messageHash,
            signature,
            amountStake,
            expiringDate
        };
    } catch (exception) {
        throw exception;
    }
};
const generateRecoupStakeGrant = (signer, userAddress, validity = 60 * 60 * 24) => {
    try {
        const expiringDate = Math.round((new Date()).getTime() / 1000) + validity;
        var messageHash = "0x" + abi.soliditySHA3(
            ["address", "uint"],
            [new BN(userAddress.substr(2), 16), new BN(String(expiringDate), 10)]
        ).toString("hex");
        let signature = web3.eth.sign(signer, messageHash);
        return {
            messageHash,
            signature,
            expiringDate
        };
    } catch (exception) {
        throw exception;
    }
};




contract("ETHDenverStaking", async function (accounts) {
    let owner = accounts[0];
    let staker = accounts[1];
    let userAddress = accounts[2];
    let signer = accounts[3];
    let invalidSigner = accounts[4];
    let invalidUserAddress = accounts[5];
    let sender = accounts[6];
    let changedSigner = accounts[7];

    beforeEach(async function () {
        this.contract = await ETHDenverStaking.new(signer, eventIsOver, { from: owner });
        this.grant = generateStakeGrant(signer, userAddress);
        this.invalidGrant = generateStakeGrant(invalidSigner, userAddress);
    });

    describe('ETHDenverStaking - stake', () => {

        it("success", async function () {
            await this.contract.stake(userAddress, this.grant.expiringDate, this.grant.signature, { from: staker, value: this.grant.amountStake });
        });
        it("success and contract balance increased", async function () {
            await this.contract.stake(userAddress, this.grant.expiringDate, this.grant.signature, { from: staker, value: this.grant.amountStake });
            let balance = Number(await ethAsync.getBalance(this.contract.address));
            assert(balance === this.grant.amountStake, 'Contract balance is not correct');
        });

        it("twice fails", async function () {
            await this.contract.stake(userAddress, this.grant.expiringDate, this.grant.signature, { from: staker, value: this.grant.amountStake });
            await assertRevert(this.contract.stake(userAddress, this.grant.expiringDate, this.grant.signature, { from: staker, value: this.grant.amountStake }));
        });

        it("with invalid signer fails", async function () {
            await assertRevert(this.contract.stake(userAddress, this.invalidGrant.expiringDate, this.invalidGrant.signature, { from: staker, value: this.invalidGrant.amountStake }));
        });

        it("with invalid signature (userAddress) fails", async function () {
            await assertRevert(this.contract.stake(invalidUserAddress, this.grant.expiringDate, this.grant.signature, { from: staker, value: this.grant.amountStake }));
        });

        it("with invalid signature (expiringDate) fails", async function () {
            await assertRevert(this.contract.stake(userAddress, this.grant.expiringDate + 1, this.grant.signature, { from: staker, value: this.grant.amountStake }));
        });

        it("with invalid signature (amountStake) fails", async function () {
            await assertRevert(this.contract.stake(userAddress, this.grant.expiringDate, this.grant.signature, { from: staker, value: (this.grant.amountStake + 10) }));
        });

        it("with invalid signature (signature) fails", async function () {
            await assertRevert(this.contract.stake(userAddress, this.grant.expiringDate, this.invalidGrant.signature, { from: staker, value: this.grant.amountStake }));
        });

        it("with signature in the past fails", async function () {
            let pastGrant = generateStakeGrant(signer, userAddress, 60 * 60 * 24 * -1)
            await assertRevert(this.contract.stake(userAddress, pastGrant.expiringDate, pastGrant.signature, { from: staker, value: pastGrant.amountStake }));
        });

        it("of several users success", async function () {
            let grant1 = generateStakeGrant(signer, accounts[1]);
            await this.contract.stake(accounts[1], grant1.expiringDate, grant1.signature, { from: staker, value: grant1.amountStake });
            let grant2 = generateStakeGrant(signer, accounts[2]);
            await this.contract.stake(accounts[2], grant2.expiringDate, grant2.signature, { from: staker, value: grant2.amountStake });
            let grant3 = generateStakeGrant(signer, accounts[3]);
            await this.contract.stake(accounts[3], grant3.expiringDate, grant3.signature, { from: staker, value: grant3.amountStake });
            let grant4 = generateStakeGrant(signer, accounts[4]);
            await this.contract.stake(accounts[4], grant4.expiringDate, grant4.signature, { from: staker, value: grant4.amountStake });
            let grant5 = generateStakeGrant(signer, accounts[5]);
            await this.contract.stake(accounts[5], grant5.expiringDate, grant5.signature, { from: staker, value: grant5.amountStake });
        });

    });
    describe('ETHDenverStaking - recoupStake', () => {

        beforeEach(async function () {
            this.recoupGrant = generateRecoupStakeGrant(signer, userAddress);
            this.recoupInvalidGrant = generateRecoupStakeGrant(invalidSigner, userAddress);
        })

        it("success", async function () {
            await this.contract.stake(userAddress, this.grant.expiringDate, this.grant.signature, { from: staker, value: this.grant.amountStake });

            let balanceBeforeRecoup = Number(await ethAsync.getBalance(staker));
            await this.contract.recoupStake(userAddress, this.recoupGrant.expiringDate, this.recoupGrant.signature, { from: sender });
            let balanceAfterRecoup = Number(await ethAsync.getBalance(staker));
            let expectedBalance = balanceBeforeRecoup + this.grant.amountStake;

            assert(balanceAfterRecoup === expectedBalance, "Amount recouped is not the same as the amount staked");
        });

        it("without staking fails", async function () {
            await assertRevert(this.contract.recoupStake(userAddress, this.recoupGrant.expiringDate, this.recoupGrant.signature, { from: sender }));
        });

        it("with invalid signerfails", async function () {
            await this.contract.stake(userAddress, this.grant.expiringDate, this.grant.signature, { from: staker, value: this.grant.amountStake });
            await assertRevert(this.contract.recoupStake(userAddress, this.recoupInvalidGrant.expiringDate, this.recoupInvalidGrant.signature, { from: sender }));
        });

    });

    describe('ETHDenverStaking - sweepStake', () => {

        it("before the end of the event fails ", async function () {
            await assertRevert(this.contract.sweepStakes({ from: owner }));
        });

        it("after the end of the event success", async function () {
            var fakeEndDate = Math.round((new Date()).getTime() / 1000) - 10000;
            let contract = await ETHDenverStaking.new(signer, fakeEndDate, { from: owner });
            await contract.stake(userAddress, this.grant.expiringDate, this.grant.signature, { from: staker, value: this.grant.amountStake });
            let balanceBeforeSweep = Number(await ethAsync.getBalance(owner));
            let tx = await contract.sweepStakes({ from: owner });
            let balanceAfterSweep = Number(await ethAsync.getBalance(owner));
            let expectedBalance = balanceBeforeSweep + this.grant.amountStake - (tx.receipt.gasUsed * 100000000000);
            assert(balanceAfterSweep === expectedBalance, 'Amount received is not correct');
        });

    });

    describe('ETHDenverStaking - setGrantSigner', () => {
        beforeEach(async function () {
            this.grantChangedSigner = generateStakeGrant(changedSigner, userAddress);
            this.recoupChangedGrant = generateRecoupStakeGrant(changedSigner, userAddress);
            await this.contract.setGrantSigner(changedSigner, { from: owner });
        })

        it("stake with changed signer success", async function () {
            await this.contract.stake(userAddress, this.grantChangedSigner.expiringDate, this.grantChangedSigner.signature, { from: staker, value: this.grantChangedSigner.amountStake });
        });

        it("recoup stake with changed signer success", async function () {
            await this.contract.stake(userAddress, this.grantChangedSigner.expiringDate, this.grantChangedSigner.signature, { from: staker, value: this.grantChangedSigner.amountStake });
            await this.contract.recoupStake(userAddress, this.recoupChangedGrant.expiringDate, this.recoupChangedGrant.signature, { from: staker });
        });
        it("without being an owner fails", async function () {
            await assertRevert(this.contract.setGrantSigner(changedSigner, { from: sender }));
        });


    });
});


