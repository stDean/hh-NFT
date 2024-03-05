// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.8;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

error ERC721Metadata__URI_QueryFor_NonExistentToken();

contract DynamicSvgNFT is ERC721, Ownable {
  uint256 private s_tokenCounter;
  string private s_lowImageURI;
  string private s_highImageURI;

  mapping(uint256 => int256) private s_tokenIdToHighValues;
  AggregatorV3Interface internal immutable i_priceFeed;

  event CreatedNFT(uint256 indexed tokenId, int256 highValue);

  constructor(
    address priceFeedAddress,
    string memory lowSvg,
    string memory highSvg
  ) ERC721("Dynamic SVG NFT", "DSN") Ownable(msg.sender) {
    i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    s_tokenCounter = 0;
    s_lowImageURI = svgToImgUrl(lowSvg);
    s_highImageURI = svgToImgUrl(highSvg);
  }

  function svgToImgUrl(string memory svg) public pure returns (string memory) {
    // example:
    // '<svg width="500" height="500" viewBox="0 0 285 350" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="black" d="M150,0,L75,200,L225,200,Z"></path></svg>'
    // would return ""

    string memory baseURL = "data:image/svg+xml;base64,";
    string memory svgBase64Encoded = Base64.encode(
      bytes(string(abi.encodePacked(svg)))
    );
    return string(abi.encodePacked(baseURL, svgBase64Encoded));
  }

  function mintNft(int256 highValue) public {
    uint256 newTokenId = s_tokenCounter;
    s_tokenIdToHighValues[newTokenId] = highValue;

    _safeMint(msg.sender, newTokenId);
    s_tokenCounter += 1;
    emit CreatedNFT(newTokenId, highValue);
  }

  function _baseURI() internal pure override returns (string memory) {
    return "data:application/json;base64,";
  }

  function tokenURI(
    uint256 tokenId
  ) public view override returns (string memory) {
    // if (ownerOf(tokenId) != address(0)) {
    //   revert ERC721Metadata__URI_QueryFor_NonExistentToken();
    // }

    (, int256 price, , , ) = i_priceFeed.latestRoundData();
    string memory imageURI = s_lowImageURI;
    if (price >= s_tokenIdToHighValues[tokenId]) {
      imageURI = s_highImageURI;
    }

    return
      string(
        abi.encodePacked(
          _baseURI(),
          Base64.encode(
            bytes(
              abi.encodePacked(
                '{"name":"',
                name(), // You can add whatever name here
                '", "description":"An NFT that changes based on the Chainlink Feed", ',
                '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
                imageURI,
                '"}'
              )
            )
          )
        )
      );
  }

  function getTokenCounter() public view returns (uint256) {
    return s_tokenCounter;
  }

  function getLowSVG() public view returns (string memory) {
    return s_lowImageURI;
  }

  function getHighSVG() public view returns (string memory) {
    return s_highImageURI;
  }

  function getPriceFeed() public view returns (AggregatorV3Interface) {
    return i_priceFeed;
  }
}
