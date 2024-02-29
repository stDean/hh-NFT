const { network, ethers } = require("hardhat")
const {
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ deployments, getNamedAccounts }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const BASE_FEE = ethers.parseEther("0.25")
  const GAS_PRICE_LINK = 1e9

  if (developmentChains.includes(network.name)) {
    log("Local Network Detected, Deploying Mocks!!!")

    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      args: [BASE_FEE, GAS_PRICE_LINK],
      log: true,
    })

    await deploy("MockV3Aggregator", {
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER],
    })
    log("Mocks Deployed")
    log(
      "================================================================================================",
    )
  }
}

module.exports.tags = ["all", "mocks"]
