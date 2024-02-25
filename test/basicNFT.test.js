const { assert } = require("chai")
const { getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip()
  : describe("test for basic NFT", () => {
      let basicNFT, deployer

      beforeEach(async () => {
        const accounts = await ethers.getSigners()
        deployer = accounts[0]
        await deployments.fixture(["all"])
        const basicNFTContract = await deployments.get("BasicNFT")
        basicNFT = await ethers.getContractAt(
          basicNFTContract.abi,
          basicNFTContract.address,
        )
      })

      describe("constructor", () => {
        it("should initailize properly", async () => {
          const name = await basicNFT.name()
          const symbol = await basicNFT.symbol()
          const res = await basicNFT.getTokenCounter()
          assert.equal(name, "Dogie")
          assert.equal(symbol, "DOG")
          assert.equal(res.toString(), "0")
        })
      })

      describe("mintNFT", () => {
        beforeEach(async () => {
          const txResponse = await basicNFT.mintNft()
          await txResponse.wait(1)
        })

        it("should allow users to mint an NFT, and updates appropriately", async () => {
          const tokenURI = await basicNFT.tokenURI(0)
          const tokenCounter = await basicNFT.getTokenCounter()

          assert.equal(tokenCounter.toString(), "1")
          assert.equal(tokenURI, await basicNFT.TOKEN_URI())
        })

        it("Show the correct balance and owner of an NFT", async function () {
          const deployerAddress = deployer.address
          const deployerBalance = await basicNFT.balanceOf(deployerAddress)
          const owner = await basicNFT.ownerOf("0")

          assert.equal(deployerBalance.toString(), "1")
          assert.equal(owner, deployerAddress)
        })
      })
    })
