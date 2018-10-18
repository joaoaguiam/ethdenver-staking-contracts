var Migrations = artifacts.require("./Migrations.sol");
var ETHDenverStaking = artifacts.require("./ETHDenverStaking.sol");

//
const grantSigner = "0xc1E19BDD3DBBA6c070579083E3B0D4C92fcaE0B3";
// februrary 18th midnight MST
const eventIsOver = 1550469600;

module.exports = async (deployer) => {
  deployer.deploy(Migrations);
  deployer.deploy(ETHDenverStaking, grantSigner, eventIsOver);
  // let contract = await ETHDenverStaking.deployed();


  // let contract = instances[0];
  // // console.log(fiatData);
  // // console.log(eventsFactory);
  // console.log("ETHDenverStaking Smart Contract Address: " + contract.address);

};
