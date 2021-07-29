const KYCoin = artifacts.require("KYCoin.sol");

module.exports = function(deployer) {
  deployer.deploy(KYCoin, 'KY', 'KY Coin')
};
