// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

error ERC721Metadata__URI_QueryFor_NonExistentToken();

contract DynamicSvgNFT is ERC721, Ownable {
  uint256 private s_tokenCounter;
  string private s_lowImageURI;
  string private s_highImageURI;

  event CreatedNFT(uint256 indexed tokenId, int256 highValue);

  constructor(
    string memory lowSvg,
    string memory highSvg
  ) ERC721("Dynamic SVG NFT", "DSN") Ownable(msg.sender) {
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

    _safeMint(msg.sender, newTokenId);
    s_tokenCounter += 1;
    emit CreatedNFT(newTokenId, highValue);
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
}
