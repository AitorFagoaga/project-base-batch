// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ProjectNFT
 * @notice ERC-721 NFT representing proof-of-backing for a launchpad project
 * @dev Each project on the launchpad deploys its own instance of this contract.
 *      Investment amounts are stored on-chain for verifiability.
 */
contract ProjectNFT is ERC721, Ownable {
    // ═════════════════════════════════════════════════════════════════════════════
    // STATE
    // ═════════════════════════════════════════════════════════════════════════════

    /// @notice Counter for token IDs
    uint256 private _tokenIdCounter;

    /// @notice Base URI for token metadata (IPFS)
    string private _baseTokenURI;

    /// @notice Investment amount (in wei) for each minted token
    mapping(uint256 => uint256) private _investments;

    /// @notice Only the Launchpad contract can mint NFTs
    address public immutable launchpad;

    // ═════════════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═════════════════════════════════════════════════════════════════════════════

    event NFTMinted(
        address indexed backer,
        uint256 indexed tokenId,
        uint256 investmentAmount
    );

    // ═════════════════════════════════════════════════════════════════════════════
    // ERRORS
    // ═════════════════════════════════════════════════════════════════════════════

    error OnlyLaunchpad();
    error TokenDoesNotExist();

    // ═════════════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═════════════════════════════════════════════════════════════════════════════

    /**
     * @param name NFT collection name (e.g., "MyProject Backer NFT")
     * @param symbol NFT collection symbol (e.g., "MYPROJ")
     * @param baseTokenURI_ IPFS URI for shared metadata (e.g., "ipfs://Qm.../metadata.json")
     * @param launchpadAddress Address of the Launchpad contract (only minter)
     */
    constructor(
        string memory name,
        string memory symbol,
        string memory baseTokenURI_,
        address launchpadAddress
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _baseTokenURI = baseTokenURI_;
        launchpad = launchpadAddress;
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // MINTING (LAUNCHPAD ONLY)
    // ═════════════════════════════════════════════════════════════════════════════

    /**
     * @notice Mint a new NFT to a backer with their investment amount
     * @param backer Address of the backer receiving the NFT
     * @param investmentAmount Amount of ETH invested (in wei)
     * @return tokenId The ID of the newly minted token
     * @dev Can only be called by the Launchpad contract
     */
    function mintToBacker(
        address backer,
        uint256 investmentAmount
    ) external returns (uint256) {
        if (msg.sender != launchpad) revert OnlyLaunchpad();

        uint256 tokenId = _tokenIdCounter++;
        _investments[tokenId] = investmentAmount;
        _safeMint(backer, tokenId);

        emit NFTMinted(backer, tokenId, investmentAmount);

        return tokenId;
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═════════════════════════════════════════════════════════════════════════════

    /**
     * @notice Get the investment amount for a specific token
     * @param tokenId The token ID to query
     * @return Investment amount in wei
     */
    function getInvestmentAmount(uint256 tokenId) external view returns (uint256) {
        if (_ownerOf(tokenId) == address(0)) revert TokenDoesNotExist();
        return _investments[tokenId];
    }

    /**
     * @notice Get total number of NFTs minted
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @notice Get the base URI for token metadata
     */
    function baseURI() external view returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Override base URI accessor used by ERC721
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @inheritdoc ERC721
     * @dev All project NFTs share the same metadata file. The default
     *      ERC721 implementation appends the tokenId to the base URI,
     *      which would produce invalid IPFS paths like `ipfs://hash0`.
     *      We override the behaviour to always return the stored base
     *      URI so wallets can resolve the metadata (and image) correctly.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (_ownerOf(tokenId) == address(0)) revert TokenDoesNotExist();
        return _baseTokenURI;
    }

    /**
     * @notice Get all tokens owned by an address
     * @param owner Address to query
     * @return Array of token IDs owned by the address
     */
    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokens = new uint256[](tokenCount);
        uint256 index = 0;

        for (uint256 i = 0; i < _tokenIdCounter && index < tokenCount; i++) {
            if (_ownerOf(i) == owner) {
                tokens[index] = i;
                index++;
            }
        }

        return tokens;
    }
}
