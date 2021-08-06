const KYCoin2 = artifacts.require("KYCoin2");

describe("KYCoin2", () => {
  let accounts;
  let owner;
  let CoinInstance;

  beforeEach(async function () {
    accounts = await web3.eth.getAccounts();
    owner = accounts[0];
    CoinInstance = await KYCoin2.new('KY', 'KY Coin')
  })

  describe("KYCoin2 contract creation", function() {
    it("should put 100000000000 MetaCoin in the first account", async () => {
      const balance = await CoinInstance.balanceOf.call(owner)
      assert.equal(balance.valueOf(), 100000000000, "100000000000 wasn't in the first account")
    })
  })
})
