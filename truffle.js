var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = "absent immune quarter trade purpose quote broom maze embark actress hold palace"

module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            //gas: 6721975,
            //gasPrice: 20000000000,  
            gas: 2000000,   // <--- Twice as much
            gasPrice: 10000000000,
            network_id: "*" // Match any network id
        },
        ropsten: {
            provider: function () {
                return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/EZyTApAawdQGy2Xnb6GS")
            },
            gas: 4698712,
            network_id: 3
        },
        rinkeby: {
            provider: function () {
                return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/EZyTApAawdQGy2Xnb6GS")
            },
            gas: 4698712,
            network_id: 4
        },
    },
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    },
};

// ropsten passphrase: ethdenver
// ropsten address: 0x3d6a6e7a113ad77cd4905a570cbca3785117ec5e


/*

Running migration: 2_factory_migration.js
  Deploying FungibleAssetStoreFactory...
  ... 0x15cdf3b79a51845adbe8398de71d9123b8ccafbdd1bc5b225e53c103d2ae0679
  FungibleAssetStoreFactory: 0xda47a8aa2604fbc0ec61dc4381e1f7db74bdb227
Saving successful migration to network...
Factory Smart Contract Address: 0xda47a8aa2604fbc0ec61dc4381e1f7db74bdb227
  ... 0x79673855b526a6d1d9c210d7d7e048fb3d395b09c8163a37f3aed947169d78c8
Saving artifacts...

Alien Store: 0xd784145573a18a248049e5058ac10bc692919a0a

*/
