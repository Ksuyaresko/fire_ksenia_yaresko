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
        it('should transfer token to contract', async function() {
            const amount = web3.utils.toBN(100)
            const initialBalance = await tokenInstance.balanceOf(depositInstance.address)

            const approve = await tokenInstance.approve(depositInstance.address, amount, {from: owner})
            const deposit = await depositInstance.deposit(amount, {from: owner})

            const balance = await tokenInstance.balanceOf(depositInstance.address)
            assert.equal(balance.sub(initialBalance).toString(), amount.toString(), 'transfer token failed')
        })
        it('should show available deposit', async function() {
            const amount = web3.utils.toBN(100)
            const approve = await tokenInstance.approve(depositInstance.address, amount, {from: owner})
            const deposit = await depositInstance.deposit(amount, {from: owner})
            const d = await depositInstance.availableToWithdraw({from: owner})
            assert.equal(d.toString(), amount.toString(), 'wrong available deposit')
        })
        it('should withdraw deposit', async function() {
            const amount = web3.utils.toBN(100)
            const approve = await tokenInstance.approve(depositInstance.address, amount, {from: owner})
            const deposit = await depositInstance.deposit(amount, {from: owner})

            const balanceBeforeWithdraw = await tokenInstance.balanceOf(owner)
            await depositInstance.withdraw(amount, {from: owner})
            const balanceAfterWithdraw = await tokenInstance.balanceOf(owner)
            assert.equal(balanceAfterWithdraw.sub(balanceBeforeWithdraw).toString(), amount.toString(), 'wrong withdraw to account')
        })
    })
})