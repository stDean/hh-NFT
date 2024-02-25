require("dotenv").config()
require("@nomicfoundation/hardhat-toolbox")
require("@nomiclabs/hardhat-solhint")
require("hardhat-deploy")
require("hardhat-deploy-ethers")
require("hardhat-gas-reporter")
require("solidity-coverage")

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || ""
const PRIVATE_KEY = process.env.PRIVATE_KEY || ""
const ETHERSCAN_APIKEY = process.env.ETHERSCAN_APIKEY || ""
const COINMARKET_APIKEY = process.env.COINMARKET_APIKEY || ""

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [{ version: "0.8.8" }, { version: "0.6.6" }, { version: "0.8.20" }],
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      // gasPrice: 130000000000,
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations: 6,
    },
    // this runs a hardhat dev in the console (yarn hardhat node)
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_APIKEY,
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    coinmarketcap: COINMARKET_APIKEY,
    token: "MATIC",
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
}
