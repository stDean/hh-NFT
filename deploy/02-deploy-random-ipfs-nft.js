const { network, ethers } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const {
  storeImages,
  storeTokenUriMetadata,
} = require("../utils/uploadToPinata")

const imagesLocation = "./images/random/"
const metadataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      trait_type: "Cuteness",
      value: 100,
    },
  ],
}

const VRF_SUB_FUNF_AMT = ethers.parseEther("2")

// const tokenUris = [
//   "ipfs://QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo",
//   "ipfs://QmYQC5aGZu2PTH8XzbJrbDnvhj3gVs7ya33H9mqUNvST3d",
//   "ipfs://QmZYmH5iDbD6v3U2ixoVAjioSzvWJszDzYdbeCLquGSpVm",
// ]

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId
  log(
    "------------------------------------------------------------------------------------",
  )

  let dogTokenUris = [
    "ipfs://QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo",
    "ipfs://QmYQC5aGZu2PTH8XzbJrbDnvhj3gVs7ya33H9mqUNvST3d",
    "ipfs://QmZYmH5iDbD6v3U2ixoVAjioSzvWJszDzYdbeCLquGSpVm",
  ]

  if (process.env.UPLOAD_TO_PINATA === "true") {
    dogTokenUris = await handleTokenUris()
  }

  let vrfCoordinatorV2MockAddress, subscriptionId
  if (developmentChains.includes(network.name)) {
    // getting this because i would have deployed mok first in loclhot deployment
    const contractAddress = (await get("VRFCoordinatorV2Mock")).address
    vrfV2CoordinatorV2Mock = await ethers.getContractAt(
      "VRFCoordinatorV2Mock",
      contractAddress,
    )
    vrfCoordinatorV2MockAddress = vrfV2CoordinatorV2Mock.target

    // create the subscription
    const transactionResponse =
      await vrfV2CoordinatorV2Mock.createSubscription()
    const transactionReceipt = await transactionResponse.wait(1)
    subscriptionId = transactionReceipt.logs[0].args.subId

    // Fund the subscription
    await vrfV2CoordinatorV2Mock.fundSubscription(
      subscriptionId,
      VRF_SUB_FUNF_AMT,
    )
  } else {
    vrfCoordinatorV2MockAddress = networkConfig[chainId]["vrfCoordinatorV2"]
    subscriptionId = networkConfig[chainId]["subscriptionId"]
  }

  const keyHash = networkConfig[chainId]["keyHash"]
  const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]
  const mintFee = networkConfig[chainId]["mintFee"]
  const args = [
    vrfCoordinatorV2MockAddress,
    keyHash,
    callbackGasLimit,
    subscriptionId,
    dogTokenUris,
    mintFee,
  ]

  const randomIPFS = await deploy("RandomIPFS_NFT", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  })

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_APIKEY
  ) {
    await verify(randomIPFS.address, args)
  }

  log(
    "==================================================================================================",
  )
}

async function handleTokenUris() {
  let tokenUris = []

  /**
   * store image in IPFS
   * store metadata in IPFS
   */
  const { responses: imageUploadResponses, files } =
    await storeImages(imagesLocation)

  for (const imageUploadResponseIndex in imageUploadResponses) {
    let tokenUriMetadata = { ...metadataTemplate }
    tokenUriMetadata.name = files[imageUploadResponseIndex].replace(
      /\b.png|\b.jpg|\b.jpeg/,
      "",
    )
    tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`
    tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`
    console.log(`Uploading ${tokenUriMetadata.name}...`)

    // store the JSON to Pinata
    const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata)
    tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
  }

  console.log("Token URIs uploaded! They are:")
  console.log(tokenUris)
  return tokenUris
}

module.exports.tags = ["all", "randomIPFS"]
