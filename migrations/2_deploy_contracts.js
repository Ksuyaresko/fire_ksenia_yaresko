const { networks } = require("../truffle-config");

const KYCoin2 = artifacts.require("KYCoin2.sol");
const Deposit = artifacts.require("Deposit.sol");

module.exports = function(deployer) {
  // if (network !== 'coverage') {
  //   deployer.deploy(KYCoin2, 'KY', 'KY Coin')
  // }
  deployer.deploy(KYCoin2, 'KY Coin', 'KY').then(function() {
    return deployer.deploy(Deposit, KYCoin2.address);
  })
};
