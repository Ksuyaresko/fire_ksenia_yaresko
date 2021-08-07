const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const { ZERO_ADDRESS } = constants;
const KYCoin2 = artifacts.require("KYCoinMock");

const coinName = 'KY Coin'
const coinSymbol = 'KY'

describe("KYCoin2", () => {
  let accounts;
  let initialHolder;
  let CoinInstance;
  const initialSupply = new BN(100000000000);

  beforeEach(async function () {
    accounts = await web3.eth.getAccounts();
    initialHolder = accounts[0];
    CoinInstance = await KYCoin2.new(coinName, coinSymbol, initialHolder, initialSupply)
  })

  describe("KYCoin2 contract creation", function() {
    it("should put 100000000000 MetaCoin in the first account", async () => {
      const balance = await CoinInstance.balanceOf.call(initialHolder)
      assert.equal(balance.valueOf(), initialSupply, "100000000000 wasn't in the first account")
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
      await CoinInstance.transfer(ac, amount, {from: initialHolder})
      const balanceAfterTransfer = await CoinInstance.balanceOf.call(ac)
      assert.equal(balanceAfterTransfer - initialBalance, amount, "coin transfer doesn't work properly")
    })
  })
  describe("allowance", function() {
    it("should approve amount", async() => {
      const spender = accounts[2]
      const amount = 1000
      await CoinInstance.approve(spender, amount, {from: initialHolder})
      const amountAllowed = await CoinInstance.allowance(initialHolder, spender)
      assert.equal(amountAllowed, amount, "allowance equals amount")
    })
    it("should increaseAllowance", async function() {
      const spender = accounts[2]
      const amount = 1000
      const initialAmountAllowed = await CoinInstance.allowance(initialHolder, spender)
      await CoinInstance.increaseAllowance(spender, amount, {from: initialHolder})
      const amountAllowed = await CoinInstance.allowance(initialHolder, spender)
      assert.equal(amountAllowed - initialAmountAllowed, amount, "allowance should be bigger then initial")
    })
    it("should reverts when there was no approved amount before", async function() {
      const spender = accounts[2]
      const amount = 1000
      await expectRevert(CoinInstance.decreaseAllowance(
        spender, amount, { from: accounts[3] }), 'ERC20: decreased allowance below zero',
      );
    })
    it("should decrease allowance", async function() {
      const spender = accounts[2]
      const amount = 1000
      const initialAmountAllowed = await CoinInstance.allowance(initialHolder, spender)
      await CoinInstance.decreaseAllowance(spender, amount, {from: initialHolder})
      const amountAllowed = await CoinInstance.allowance(initialHolder, spender)
      assert.equal(initialAmountAllowed - amountAllowed, amount, "allowance should be less then initial")
    })
  })

  describe('_mint', function () {
    const amount = new BN(50);
    it('rejects a null account', async function () {
      await expectRevert(
        CoinInstance.mint(ZERO_ADDRESS, amount), 'ERC20: mint to the zero address',
      );
    });

    describe('for a non zero account', function () {
      beforeEach('minting', async function () {
        const { logs } = await CoinInstance.mint(accounts[3], amount);
        this.logs = logs;
      });

      it('increments totalSupply', async function () {
        const expectedSupply = initialSupply.add(amount);
        expect(await CoinInstance.totalSupply()).to.be.bignumber.equal(expectedSupply);
      });

      it('increments recipient balance', async function () {
        expect(await CoinInstance.balanceOf(accounts[3])).to.be.bignumber.equal(amount);
      });

      it('emits Transfer event', async function () {
        const event = expectEvent.inLogs(this.logs, 'Transfer', {
          from: ZERO_ADDRESS,
          to: accounts[3],
        });

        expect(event.args.value).to.be.bignumber.equal(amount);
      });
    });
  });

  describe('_burn', function () {
    it('rejects a null account', async function () {
      await expectRevert(CoinInstance.burn(ZERO_ADDRESS, new BN(1)),
        'ERC20: burn from the zero address');
    });

    describe('for a non zero account', function () {
      it('rejects burning more than balance', async function () {
        await expectRevert(CoinInstance.burn(
          initialHolder, initialSupply.addn(1)), 'ERC20: burn amount exceeds balance',
        );
      });

      const describeBurn = function (description, amount) {
        describe(description, function () {
          beforeEach('burning', async function () {
            const { logs } = await CoinInstance.burn(initialHolder, amount);
            this.logs = logs;
          });

          it('decrements totalSupply', async function () {
            const expectedSupply = initialSupply.sub(amount);
            expect(await CoinInstance.totalSupply()).to.be.bignumber.equal(expectedSupply);
          });

          it('decrements initialHolder balance', async function () {
            const expectedBalance = initialSupply.sub(amount);
            expect(await CoinInstance.balanceOf(initialHolder)).to.be.bignumber.equal(expectedBalance);
          });

          it('emits Transfer event', async function () {
            const event = expectEvent.inLogs(this.logs, 'Transfer', {
              from: initialHolder,
              to: ZERO_ADDRESS,
            });

            expect(event.args.value).to.be.bignumber.equal(amount);
          });
        });
      };

      describeBurn('for entire balance', initialSupply);
      describeBurn('for less amount than balance', initialSupply.subn(1));
    });
  });

})
