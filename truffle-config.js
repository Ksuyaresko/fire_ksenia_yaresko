const HDWalletProvider = require('@truffle/hdwallet-provider')

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 5000000
    },
    coverage: {
      url: 'http://localhost:8555'
    },
    rinkeby: {
      networkCheckTimeout: 1000000,
      timeoutBlocks: 500,
      provider: function() {
        return new HDWalletProvider(["5f4a7713e532341fe680ea705fee0738fff81bf766ebcad86165cf8f3b978474"], "wss://rinkeby.infura.io/ws/v3/8e047de54394400eaac7b552e74b7a5a");
      },
      network_id: 4,
      gasPrice: 10000000000,
    }
  },
  compilers: {
    solc: {
      version: "0.8.0",
      settings: {
        optimizer: {
          enabled: true, // Default: false
          runs: 200      // Default: 200
        },
      }
    }
  },
  plugins: [
    'truffle-plugin-verify', 'solidity-coverage'
  ],
  api_keys: {
    etherscan: "TF29WNYZ915DSVQXV5YAWQRWTTHGB6ITWV"
  }
};
