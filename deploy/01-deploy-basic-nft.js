const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments
  const { deployer } = await getNamedAccounts()
  log(
    "------------------------------------------------------------------------------------",
  )

  const args = []
  const basicNFT = await deploy("BasicNFT", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  })

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_APIKEY
  ) {
    await verify(basicNFT.address, args)
  }

  log(
    "==================================================================================================",
  )
}
