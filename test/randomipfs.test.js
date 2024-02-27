// We are going to skimp a bit on these tests...

const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Random IPFS NFT Unit Tests", function () {
      let randomIpfsNft, deployer, vrfCoordinatorV2Mock

      beforeEach(async () => {
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        await deployments.fixture(["mocks", "randomIPFS"])
        let randomIpfsNftContract = await deployments.get("RandomIPFS_NFT")
        let vrfCoordinatorV2MockContract = await deployments.get(
          "VRFCoordinatorV2Mock",
        )
        randomIpfsNft = await ethers.getContractAt(
          randomIpfsNftContract.abi,
          randomIpfsNftContract.address,
        )
        vrfCoordinatorV2Mock = await ethers.getContractAt(
          vrfCoordinatorV2MockContract.abi,
          vrfCoordinatorV2MockContract.address,
        )
      })

      // describe("constructor", () => {
      //   it("sets starting values correctly", async function () {
      //     const dogTokenUriZero = await randomIpfsNft.getDogTokenUris(0)
      //     const isInitialized = await randomIpfsNft.getInitialized()
      //     assert(dogTokenUriZero.includes("ipfs://"))
      //     assert.equal(isInitialized, true)
      //   })
      // })

      describe("requestNft", () => {
        it("fails if payment isn't sent with the request", async function () {
          await expect(
            randomIpfsNft.requestNFT(),
          ).to.be.revertedWithCustomError(
            randomIpfsNft,
            "RandomIPFS_NFT__NeedMoreETHSent",
          )
        })

        it("reverts if payment amount is less than the mint fee", async function () {
          const fee = await randomIpfsNft.getMintFee()
          await expect(
            randomIpfsNft.requestNFT({
              value: ethers.parseEther("0.001"),
            }),
          ).to.be.revertedWithCustomError(
            randomIpfsNft,
            "RandomIPFS_NFT__NeedMoreETHSent",
          )
        })

        it("emits an event and kicks off a random word request", async function () {
          const fee = await randomIpfsNft.getMintFee()
          await expect(
            randomIpfsNft.requestNFT({
              value: "100000000000000000",
            }),
          ).to.emit(randomIpfsNft, "NFTRequsted")
        })
      })

      // describe("fulfillRandomWords", () => {
      //   it("mints NFT after random number is returned", async function () {
      //     await new Promise(async (resolve, reject) => {
      //       randomIpfsNft.once("NFTMinted", async (tokenId, breed, minter) => {
      //         try {
      //           const tokenUri = await randomIpfsNft.tokenURI(
      //             tokenId.toString(),
      // )
      // const tokenCounter = await randomIpfsNft.getTokenCounter()
      // const dogUri = await randomIpfsNft.getDogTokenUris(
      //   breed.toString(),
      // )
      //           assert.equal(tokenUri.toString().includes("ipfs://"), true)
      // assert.equal(dogUri.toString(), tokenUri.toString())
      // assert.equal(+tokenCounter.toString(), +tokenId.toString() + 1)
      // assert.equal(minter, deployer.address)
      //           resolve()
      //           console.log("Here")
      //         } catch (e) {
      //           console.log(e)
      //           reject(e)
      //         }
      //       })
      // try {
      //   const fee = await randomIpfsNft.getMintFee()
      //   const requestNftResponse = await randomIpfsNft.requestNFT({
      //     value: fee.toString(),
      //   })
      //   const requestNftReceipt = await requestNftResponse.wait(1)
      //   const randomAddress = await randomIpfsNft.getAddress()
      //   await vrfCoordinatorV2Mock.fulfillRandomWords(
      //     requestNftReceipt.logs[1].args.requestId,
      //     randomAddress,
      //   )
      // } catch (e) {
      //   console.log(e)
      //   reject(e)
      // }
      //     })
      //   })
      // })

      // describe("getBreedFromModdedRng", () => {
      //   it("should return pug if moddedRng < 10", async function () {
      //     const expectedValue = await randomIpfsNft.getBreedFromModdedRng(7)
      //     assert.equal(0, expectedValue)
      //   })
      //   it("should return shiba-inu if moddedRng is between 10 - 39", async function () {
      //     const expectedValue = await randomIpfsNft.getBreedFromModdedRng(21)
      //     assert.equal(1, expectedValue)
      //   })
      //   it("should return st. bernard if moddedRng is between 40 - 99", async function () {
      //     const expectedValue = await randomIpfsNft.getBreedFromModdedRng(77)
      //     assert.equal(2, expectedValue)
      //   })
      //   it("should revert if moddedRng > 99", async function () {
      //     await expect(
      //       randomIpfsNft.getBreedFromModdedRng(100),
      //     ).to.be.revertedWith("RandomIpfsNft__RangeOutOfBounds")
      //   })
      // })
    })
