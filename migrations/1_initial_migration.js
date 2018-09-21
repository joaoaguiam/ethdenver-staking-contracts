var Migrations = artifacts.require("./Migrations.sol");
var ETHDenverStaking = artifacts.require("./ETHDenverStaking.sol");
module.exports = async (deployer) => {
  deployer.deploy(Migrations);
  deployer.deploy(ETHDenverStaking);
  // let contract = await ETHDenverStaking.deployed();


  // let contract = instances[0];
  // // console.log(fiatData);
  // // console.log(eventsFactory);
  // console.log("ETHDenverStaking Smart Contract Address: " + contract.address);

};
