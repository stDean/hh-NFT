const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { readFileSync } = require("fs")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId
  log(
    "------------------------------------------------------------------------------------",
  )

  let ethUsdPriceFeedAddress
  if (developmentChains.includes(network.name)) {
    // get the deployed mock
    const ethUsdAggregator = await get("MockV3Aggregator")
    ethUsdPriceFeedAddress = ethUsdAggregator.address
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
  }

  log("Deploying Dynamic SVG NFT")
  const lowSVG = readFileSync("./images/dynamic/frown.svg", {
    encoding: "utf8",
  })
  const highSVG = readFileSync("./images/dynamic/happy.svg", {
    encoding: "utf8",
  })
  const args = [ethUsdPriceFeedAddress, lowSVG, highSVG]
  const dynamicNFT = await deploy("DynamicSvgNFT", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  })

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_APIKEY
  ) {
    await verify(dynamicNFT.address, args)
  }

  log(
    "==================================================================================================",
  )
}

module.exports.tags = ["all", "DynamicSvgNFT"]
