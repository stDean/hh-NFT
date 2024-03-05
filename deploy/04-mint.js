const { network, ethers } = require("hardhat")

module.exports = async ({ getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts()
  const accounts = await ethers.getSigners()
  let signer = accounts[0]
  const chainId = network.config.chainId

  // BASIC NFT
  const basicNft = await ethers.getContract("BasicNFT", deployer)
  const basicMintTx = await basicNft.mintNft()
  await basicMintTx.wait(1)
  console.log(`Basic NFT index 0 tokenURI: ${await basicNft.tokenURI(0)}`)

  // Dynamic SVG  NFT
  const highValue = ethers.parseEther("4000")
  const dynamicSvgNft = await ethers.getContract("DynamicSvgNFT", deployer)
  const dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(highValue)
  await dynamicSvgNftMintTx.wait(1)
  // console.log(
  //   `Dynamic SVG NFT index 0 tokenURI: ${await dynamicSvgNft.tokenURI(0)}`,
  // )

  // Random IPFS NFT
  const randomIpfsNft = await ethers.getContract("RandomIPFS_NFT", deployer)
  const mintFee = await randomIpfsNft.getMintFee()
  const randomIpfsNftMintTx = await randomIpfsNft.requestNFT({
    value: "100000000000000000",
  })
  console.log({ here: "there" })
  const randomIpfsNftMintTxReceipt = await randomIpfsNftMintTx.wait(1)

  // Need to listen for response
  await new Promise(async (resolve, reject) => {
    setTimeout(() => reject("Timeout: 'NFTMinted' event did not fire"), 300000) // 5 minute timeout time
    // setup listener for our event
    randomIpfsNft.once("NftMinted", async () => {
      console.log(
        `Random IPFS NFT index 0 tokenURI: ${await randomIpfsNft.tokenURI(0)}`,
      )
      resolve()
    })
    if (chainId == 31337) {
      const requestId =
        randomIpfsNftMintTxReceipt.events[1].args.requestId.toString()
      const vrfCoordinatorV2Mock = await ethers.getContract(
        "VRFCoordinatorV2Mock",
        deployer,
      )
      await vrfCoordinatorV2Mock.fulfillRandomWords(
        requestId,
        randomIpfsNft.address,
      )
    }
  })
}
