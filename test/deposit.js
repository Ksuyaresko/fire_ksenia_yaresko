const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const ERC20Token = artifacts.require("KYCoin2");
const Deposit = artifacts.require("Deposit");

describe("Deposit", function() {
  let accounts;
  let owner;
  let actor;
  let tokenInstance;
  let depositInstance;
  const amount = web3.utils.toBN(100)

    beforeEach(async function () {
      accounts = await web3.eth.getAccounts();
      owner = accounts[0];
      actor = accounts[1];

      tokenInstance = await ERC20Token.new('KY Coin', 'KY');
      depositInstance = await Deposit.new(tokenInstance.address);

      await tokenInstance.transfer(actor, amount, {from: owner})
      await tokenInstance.approve(depositInstance.address, amount, {from: actor})
      await tokenInstance.approve(depositInstance.address, amount, {from: owner})
    });

    describe("deposit contract", function() {
        it('should transfer token to contract', async function() {
            const initialBalance = await tokenInstance.balanceOf(depositInstance.address)
            const deposit = await depositInstance.deposit(amount, {from: actor})
            const balance = await tokenInstance.balanceOf(depositInstance.address)
            assert.equal(balance.sub(initialBalance).toString(), amount.toString(), 'transfer token failed')
        })
        it('should show available deposit', async function() {
            const deposit = await depositInstance.deposit(amount, {from: actor})
            const d = await depositInstance.availableToWithdraw({from: actor})
            assert.equal(d.toString(), amount.toString(), 'wrong available deposit')
        })
        it('should withdraw deposit', async function() {
            await depositInstance.deposit(amount, {from: actor})
            const balanceBeforeWithdraw = await tokenInstance.balanceOf(actor)
            await depositInstance.withdraw(amount, {from: actor})
            const balanceAfterWithdraw = await tokenInstance.balanceOf(actor)
            assert.equal(balanceAfterWithdraw.sub(balanceBeforeWithdraw).toString(), amount.toString(), 'wrong withdraw to account')
        })
    })

    describe("deposit ETH to contract", function() {
        it('should transfer ETH to contract', async function() {
            const initialBalance = await depositInstance.balanceOf()
            const deposit = await depositInstance.depositETH({from: actor, value: amount})
            const balance = await depositInstance.balanceOf()
            assert.equal(balance.sub(initialBalance).toString(), amount.toString(), 'transfer ETH failed')
        })
        it('should show avaliable ETH', async function() {
            const deposit = await depositInstance.depositETH({from: actor, value: amount})
            const balance = await depositInstance.availableToWithdrawETH({from: actor})
            assert.equal(balance.toString(), amount.toString(), 'wrong available ETH deposit')
        })
        it('should withdraw ETH', async function() {
            await depositInstance.depositETH({from: actor, value: amount})
            const balance = await web3.eth.getBalance(actor)
            const withdraw = await depositInstance.withdrawETH(amount, {from: actor})
            const balanceAfterWithdraw = await web3.eth.getBalance(actor)

            const gasUsed = web3.utils.toBN(withdraw.receipt.gasUsed)
            const tx = await web3.eth.getTransaction(withdraw.tx);
            const gasPrice = web3.utils.toBN(tx.gasPrice);
            const spend = gasUsed.mul(gasPrice)
            const dif = web3.utils.toBN(balanceAfterWithdraw).add(spend).sub(web3.utils.toBN(balance))

            assert.equal(dif.toString(), amount.toString(), 'wrong ETH withdraw')
        })
    })

   describe("add and remove token by owner", function() {
        it('add token', async function() {
            const initialBalance = await tokenInstance.balanceOf(depositInstance.address)
            await depositInstance.depositOwner(amount, {from: owner})
            const balanceAfterDeposit = await tokenInstance.balanceOf(depositInstance.address)
            assert.equal(balanceAfterDeposit.sub(initialBalance).toString(), amount.toString(), 'add token by owner didnt work')
        })
        it('remove token', async function() {
            await depositInstance.depositOwner(amount, {from: owner})
            await depositInstance.withdrawOwner(amount, {from: owner})
            const balance = await tokenInstance.balanceOf(depositInstance.address)
            assert.equal(balance.toString(), 0, 'remove token by owner didnt work')
        })
        it('add token not by owner', async function() {
            await expectRevert(depositInstance.depositOwner(amount, {from: actor}), 'You are not the owner.',
          )})
         it('remove token not by owner', async function() {
           await depositInstance.depositOwner(amount, {from: owner})
           await expectRevert(depositInstance.withdrawOwner(amount, {from: actor}), 'You are not the owner.',
         );
       })
    })

    describe('add and remove ETH by owner', function() {
        it('add eth', async function() {
            const initialBalance = await depositInstance.balanceOf()
            const deposit = await depositInstance.depositOwnerETH({from: owner, value: amount})
            const balance = await depositInstance.balanceOf()
            assert.equal(balance.sub(initialBalance).toString(), amount.toString(), 'transfer ETH failed')
        })
        it('withdraw eth', async function() {
            await depositInstance.depositETH({from: owner, value: amount})
            const balance = await web3.eth.getBalance(owner)
            const withdraw = await depositInstance.withdrawOwnerETH(amount, {from: owner})
            const balanceAfterWithdraw = await web3.eth.getBalance(owner)

            const gasUsed = web3.utils.toBN(withdraw.receipt.gasUsed)
            const tx = await web3.eth.getTransaction(withdraw.tx);
            const gasPrice = web3.utils.toBN(tx.gasPrice);
            const spend = gasUsed.mul(gasPrice)
            const dif = web3.utils.toBN(balanceAfterWithdraw).add(spend).sub(web3.utils.toBN(balance))

            assert.equal(dif.toString(), amount.toString(), 'wrong ETH withdraw by owner')
        })
    })

})