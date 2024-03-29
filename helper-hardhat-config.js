const { ethers } = require("hardhat")

const networkConfig = {
  11155111: {
    name: "sepolia",
    vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
    entranceFee: ethers.parseEther("0.01"),
    keyHash:
      "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
    subscriptionId: "8853",
    callbackGasLimit: "500000",
    interval: "30",
    mintFee: "100000000000000000",
    ethUsdPriceFeed: "0x1a81afB8146aeFfCFc5E50e8479e826E7D55b910",
  },
  31337: {
    name: "hardhat",
    entranceFee: ethers.parseEther("0.01"),
    keyHash:
      "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
    callbackGasLimit: "500000",
    interval: "30",
    mintFee: "100000000000000000",
  },
}

const developmentChains = ["hardhat", "localhost"]

const DECIMALS = 8
const INITIAL_ANSWER = 200000000000

module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER
}
