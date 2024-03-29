// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.8;

// VRF
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// ERRORS
error RandomIPFS_NFT__AlreadyInitialized();
error RandomIPFS_NFT__NeedMoreETHSent();
error RandomIPFS_NFT__RangeOutOfBounds();
error RandomIPFS_NFT__TransferFailed();

contract RandomIPFS_NFT is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
  /**
   * when you mint an NFT, we trigger VRf to get a random number
   * using that number we will get a random NFT
   * Random NFT is either: PUG, SHIBA INU, St. BERNARD
   * make PUG === super rare
   * SHIBA === rare
   * St. BERMARD === regular
   *
   * User have to pay to mint NFT
   * owner of the contract can withdraw ETH
   */

  enum Breed {
    PUG,
    SHIBA_INU,
    ST_BERNARD
  }

  // VRF Variables
  VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
  bytes32 private immutable i_keyHash;
  uint64 private i_subscriptionId;
  uint32 private immutable i_callbackGasLimit;
  uint16 private constant REQUEST_CONFIRMATIONS = 3;
  uint16 private constant NUM_WORD = 1;

  // VRF Helpers
  mapping(uint256 => address) public s_requestIdToSender;

  // NFT Variables
  uint256 private s_tokenCounter;
  uint256 internal constant MAX_CHANCE_VALUE = 100;
  string[] s_dogTokenUris;
  uint256 private immutable i_mintFee;
  bool private s_initialized;

  // Events
  event NFTRequsted(uint256 indexed requestId, address requester);
  event NFTMinted(Breed dogBreed, address minter);

  constructor(
    address vrfCoordinatorV2,
    bytes32 keyHash,
    uint32 callbackGasLimit,
    uint64 subscriptionId,
    string[3] memory dogTokenUris,
    uint256 mintFee
  )
    VRFConsumerBaseV2(vrfCoordinatorV2)
    ERC721("Random IPFS NFT", "RIN")
    Ownable(msg.sender)
  {
    i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
    i_keyHash = keyHash;
    i_subscriptionId = subscriptionId;
    i_callbackGasLimit = callbackGasLimit;
    s_dogTokenUris = dogTokenUris;
    i_mintFee = mintFee;
    s_tokenCounter = 0;
    _initializeContract(dogTokenUris);
  }

  function _initializeContract(string[3] memory dogTokenUris) private {
    if (s_initialized) {
      revert RandomIPFS_NFT__AlreadyInitialized();
    }

    s_dogTokenUris = dogTokenUris;
    s_initialized = true;
  }

  function requestNFT() public payable returns (uint256 requestId) {
    if (msg.value < i_mintFee) {
      revert RandomIPFS_NFT__NeedMoreETHSent();
    }

    requestId = i_vrfCoordinator.requestRandomWords(
      i_keyHash, // same as gasLane
      i_subscriptionId,
      REQUEST_CONFIRMATIONS,
      i_callbackGasLimit,
      NUM_WORD
    );

    s_requestIdToSender[requestId] = msg.sender;

    emit NFTRequsted(requestId, msg.sender);
  }

  function fulfillRandomWords(
    uint requestId,
    uint[] memory randomWords
  ) internal override {
    address dogOwner = s_requestIdToSender[requestId];
    uint256 newTokenId = s_tokenCounter;
    s_tokenCounter = s_tokenCounter + 1;

    uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;
    Breed dogBreed = getBreedFromModdedRng(moddedRng);

    _safeMint(dogOwner, newTokenId);
    _setTokenURI(newTokenId, s_dogTokenUris[uint256(dogBreed)]);

    emit NFTMinted(dogBreed, dogOwner);
  }

  function withdraw() public onlyOwner {
    uint256 amount = address(this).balance;
    (bool success, ) = payable(msg.sender).call{value: amount}("");
    if (!success) {
      revert RandomIPFS_NFT__TransferFailed();
    }
  }

  function getBreedFromModdedRng(
    uint256 moddedRng
  ) public pure returns (Breed) {
    uint256 cumulativeSum = 0;
    uint256[3] memory chanceArray = getChanceArray();

    for (uint256 i = 0; i < chanceArray.length; i++) {
      // Pug = 0 - 9  (10%)
      // Shiba-inu = 10 - 39  (30%)
      // St. Bernard = 40 = 99 (60%)
      if (moddedRng >= cumulativeSum && moddedRng < chanceArray[i]) {
        return Breed(i);
      }

      cumulativeSum = chanceArray[i];
    }

    revert RandomIPFS_NFT__RangeOutOfBounds();
  }

  function getChanceArray() public pure returns (uint256[3] memory) {
    return [10, 40, MAX_CHANCE_VALUE];
  }

  // function tokenURI(
  //   uint256 /* tokenId */
  // ) public pure override returns (string memory) {}

  function getTokenCounter() public view returns (uint256) {
    return s_tokenCounter;
  }

  function getMintFee() public view returns (uint256) {
    return i_mintFee;
  }

  function getDogTokenUris(uint256 index) public view returns (string memory) {
    return s_dogTokenUris[index];
  }

  function getInitialized() public view returns (bool) {
    return s_initialized;
  }
}
