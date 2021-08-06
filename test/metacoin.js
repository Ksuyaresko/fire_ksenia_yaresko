const KYCoin2 = artifacts.require("KYCoin2");

const coinName = 'KY Coin'
const coinSymbol = 'KY'

describe("KYCoin2", () => {
  let accounts;
  let owner;
  let CoinInstance;

  beforeEach(async function () {
    accounts = await web3.eth.getAccounts();
    owner = accounts[0];
    CoinInstance = await KYCoin2.new(coinName, coinSymbol)
  })

  describe("KYCoin2 contract creation", function() {
    it("should put 100000000000 MetaCoin in the first account", async () => {
      const balance = await CoinInstance.balanceOf.call(owner)
      assert.equal(balance.valueOf(), 100000000000, "100000000000 wasn't in the first account")
    })
    it("should have symbol", async () => {
      const name = await CoinInstance.symbol()
      assert.equal(name, coinSymbol, "wrong coin symbol")
    })
    it("should have name", async () => {
      const name = await CoinInstance.name()
      assert.equal(name, coinName, "wrong coin name")
    })
  })

  describe("transfer", function() {
    it("should transfer coin", async () => {
      const ac = accounts[1]
      const amount = 10
      const initialBalance = await CoinInstance.balanceOf.call(ac)
      await CoinInstance.transfer(ac, amount, {from: owner})
      const balanceAfterTransfer = await CoinInstance.balanceOf.call(ac)
      assert.equal(balanceAfterTransfer - initialBalance, amount, "coin transfer doesn't work properly")
    })
  })
  // describe("allowance", function() {
  //   it("should approve amount", async() => {

  //   })
  // })
})
