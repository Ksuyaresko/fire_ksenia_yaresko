const ERC20Token = artifacts.require("KYCoin2");
const Deposit = artifacts.require("Deposit");

describe("Deposit", function() {
  let accounts;
  let owner;
  let tokenInstance;
  let depositInstance;

    beforeEach(async function () {
      accounts = await web3.eth.getAccounts();
      owner = accounts[0];

      tokenInstance = await ERC20Token.new('KY Coin', 'KY');
      depositInstance = await Deposit.new(tokenInstance.address);
    });

    describe("deposit contract", function() {
        it('should add deposit', async function() {
            const amount = web3.utils.toBN(100)

            const approve = await tokenInstance.approve(depositInstance.address, amount, {from: owner})
            const allowance = await tokenInstance.allowance(owner, depositInstance.address)
            //console.log('2allowance', allowance)
            const deposit = await depositInstance.deposit(amount, {from: owner})
            //console.log('d', deposit)
            const d = await depositInstance.availableToWithdraw({from: owner})
            console.log('d', d)
            assert.equal(d.toString(), amount.toString(), 'wrong deposit')
        })
    })
})