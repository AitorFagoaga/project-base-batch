// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IReputation.sol";
import "./ProjectNFT.sol";

/**
 * @title Launchpad
 * @notice Simple crowdfunding platform with reputation-based credibility
 * @dev MVP: No refunds, all-or-nothing funding, single claim post-deadline
 */
contract Launchpad is ReentrancyGuard {
    // ═════════════════════════════════════════════════════════════════════════════
    // STRUCTS
    // ═════════════════════════════════════════════════════════════════════════════
    
    struct Project {
        uint256 id;
        address creator;
        string title;
        string description;
        string imageUrl;
        string category;
        uint256 goal; // in wei
        uint256 deadline; // timestamp
        uint256 fundsRaised;
        bool claimed;
        address[] cofounders; // List of co-founders
        address nftContract; // Address of the project's NFT contract
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // STATE
    // ═════════════════════════════════════════════════════════════════════════════
    
    /// @notice Reference to the Reputation contract
    IReputation public immutable reputation;
    
    /// @notice Counter for project IDs
    uint256 private _projectIdCounter;
    
    /// @notice Project storage
    mapping(uint256 => Project) private _projects;
    
    /// @notice Total contributions per project per backer
    mapping(uint256 => mapping(address => uint256)) private _contributions;
    
    /// @notice Mapping to check if address is a cofounder of a project
    mapping(uint256 => mapping(address => bool)) private _isCofounder;
    
    /// @notice List of contributors per project
    mapping(uint256 => address[]) private _contributors;
    
    /// @notice Whether a contribution is anonymous
    mapping(uint256 => mapping(address => bool)) private _isAnonymous;
    
    /// @notice Track if a user has inspired a project
    mapping(uint256 => mapping(address => bool)) private _hasInspired;

    /// @notice Mapping from project ID to NFT contract address
    mapping(uint256 => address) private _projectNFTs;

    // ═════════════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═════════════════════════════════════════════════════════════════════════════
    
    event ProjectCreated(
        uint256 indexed projectId,
        address indexed creator,
        string title,
        string description,
        string imageUrl,
        string category,
        uint256 goal,
        uint256 deadline
    );
    
    event CofounderAdded(
        uint256 indexed projectId,
        address indexed cofounder
    );
    
    event ContributionMade(
        uint256 indexed projectId,
        address indexed backer,
        uint256 amount,
        bool isAnonymous
    );
    
    event FundsClaimed(
        uint256 indexed projectId,
        address indexed creator,
        uint256 amount
    );

    event ProjectDeleted(
        uint256 indexed projectId,
        address indexed creator
    );
    
    event ProjectInspired(
        uint256 indexed projectId,
        address indexed inspirer,
        address indexed creator,
        uint256 reputationAwarded
    );

    event NFTMinted(
        uint256 indexed projectId,
        address indexed backer,
        address nftContract,
        uint256 tokenId,
        uint256 investmentAmount
    );

    // ═════════════════════════════════════════════════════════════════════════════
    // ERRORS
    // ═════════════════════════════════════════════════════════════════════════════
    
    error InvalidGoal();
    error InvalidDuration();
    error ProjectNotFound();
    error DeadlineNotReached();
    error GoalNotReached();
    error AlreadyClaimed();
    error NotCreator();
    error DeadlinePassed();
    error ZeroContribution();
    error TransferFailed();
    error ProjectAlreadyFunded();
    error NotCreatorOrCofounder();
    error AlreadyCofounder();
    error CannotFundOwnProject();
    error AlreadyInspired();
    error CannotInspireOwnProject();

    // ═════════════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═════════════════════════════════════════════════════════════════════════════
    
    /**
     * @param reputationAddress Address of the deployed Reputation contract
     */
    constructor(address reputationAddress) {
        reputation = IReputation(reputationAddress);
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═════════════════════════════════════════════════════════════════════════════
    
    /**
     * @notice Returns the details of a project
     * @param projectId The ID of the project
     * @return Project struct with all details
     */
    function getProject(uint256 projectId) external view returns (Project memory) {
        return _projects[projectId];
    }
    
    /**
     * @notice Returns the total number of projects created
     */
    function projectCount() external view returns (uint256) {
        return _projectIdCounter;
    }
    
    /**
     * @notice Returns the contribution of a backer to a specific project
     * @param projectId The ID of the project
     * @param backer The address of the backer
     */
    function getContribution(uint256 projectId, address backer) external view returns (uint256) {
        return _contributions[projectId][backer];
    }
    
    /**
     * @notice Returns all contributors to a project
     * @param projectId The ID of the project
     * @return Array of contributor addresses
     */
    function getContributors(uint256 projectId) external view returns (address[] memory) {
        return _contributors[projectId];
    }
    
    /**
     * @notice Check if a contribution is anonymous
     * @param projectId The ID of the project
     * @param backer The address of the backer
     */
    function isContributionAnonymous(uint256 projectId, address backer) external view returns (bool) {
        return _isAnonymous[projectId][backer];
    }
    
    /**
     * @notice Check if a user has already inspired a project
     * @param projectId The ID of the project
     * @param inspirer The address to check
     */
    function hasInspired(uint256 projectId, address inspirer) external view returns (bool) {
        return _hasInspired[projectId][inspirer];
    }

    /**
     * @notice Get the NFT contract address for a project
     * @param projectId The ID of the project
     * @return Address of the project's NFT contract
     */
    function getProjectNFT(uint256 projectId) external view returns (address) {
        return _projectNFTs[projectId];
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // MUTATIVE FUNCTIONS
    // ═════════════════════════════════════════════════════════════════════════════
    
    /**
     * @notice Creates a new crowdfunding project
     * @param title Project title
     * @param description Project description
     * @param imageUrl Project image URL (IPFS or hosted)
     * @param category Project category
     * @param goalInWei Funding goal in wei
     * @param durationInDays Duration of the campaign in days
     * @param nftName Name for the backer NFT collection
     * @param nftSymbol Symbol for the backer NFT collection
     * @param nftBaseURI IPFS URI for the NFT metadata
     * @return projectId The ID of the newly created project
     */
    function createProject(
        string calldata title,
        string calldata description,
        string calldata imageUrl,
        string calldata category,
        uint256 goalInWei,
        uint256 durationInDays,
        string calldata nftName,
        string calldata nftSymbol,
        string calldata nftBaseURI
    ) external returns (uint256 projectId) {
        if (goalInWei == 0) revert InvalidGoal();
        if (durationInDays == 0) revert InvalidDuration();

        require(bytes(title).length <= 100, "Title too long");
        require(bytes(description).length <= 1000, "Description too long");
        require(bytes(imageUrl).length <= 200, "Image URL too long");
        require(bytes(category).length <= 50, "Category too long");
        require(bytes(nftName).length > 0, "NFT name required");
        require(bytes(nftSymbol).length > 0, "NFT symbol required");
        require(bytes(nftBaseURI).length > 0, "NFT base URI required");

        uint256 deadline = block.timestamp + (durationInDays * 1 days);

        projectId = _projectIdCounter++;

        // Deploy new NFT contract for this project
        ProjectNFT nftContract = new ProjectNFT(
            nftName,
            nftSymbol,
            nftBaseURI,
            address(this)  // Launchpad is the only minter
        );

        _projects[projectId] = Project({
            id: projectId,
            creator: msg.sender,
            title: title,
            description: description,
            imageUrl: imageUrl,
            category: category,
            goal: goalInWei,
            deadline: deadline,
            fundsRaised: 0,
            claimed: false,
            cofounders: new address[](0),
            nftContract: address(nftContract)
        });

        _projectNFTs[projectId] = address(nftContract);

        emit ProjectCreated(projectId, msg.sender, title, description, imageUrl, category, goalInWei, deadline);
    }
    
    /**
     * @notice Add a co-founder to the project
     * @param projectId The ID of the project
     * @param cofounder Address of the co-founder to add
     */
    function addCofounder(uint256 projectId, address cofounder) external {
        Project storage project = _projects[projectId];
        if (project.creator == address(0)) revert ProjectNotFound();
        if (msg.sender != project.creator) revert NotCreator();
        if (_isCofounder[projectId][cofounder]) revert AlreadyCofounder();
        if (cofounder == project.creator) revert AlreadyCofounder();
        
        project.cofounders.push(cofounder);
        _isCofounder[projectId][cofounder] = true;
        
        emit CofounderAdded(projectId, cofounder);
    }
    
    /**
     * @notice Get all co-founders of a project
     * @param projectId The ID of the project
     */
    function getCofounders(uint256 projectId) external view returns (address[] memory) {
        return _projects[projectId].cofounders;
    }
    
    /**
     * @notice Check if an address is a co-founder
     * @param projectId The ID of the project
     * @param account Address to check
     */
    function isCofounder(uint256 projectId, address account) external view returns (bool) {
        return _isCofounder[projectId][account];
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // FUNDING
    // ═════════════════════════════════════════════════════════════════════════════
    
    /**
     * @notice Fund a project with ETH
     * @param projectId The ID of the project to fund
     * @param isAnonymous Whether to keep the contribution anonymous
     */
    function fundProject(uint256 projectId, bool isAnonymous) external payable {
        if (msg.value == 0) revert ZeroContribution();

        Project storage project = _projects[projectId];
        if (project.creator == address(0)) revert ProjectNotFound();
        if (block.timestamp >= project.deadline) revert DeadlinePassed();
        if (msg.sender == project.creator) revert CannotFundOwnProject();

        // Track first-time contributor
        if (_contributions[projectId][msg.sender] == 0) {
            _contributors[projectId].push(msg.sender);
        }

        project.fundsRaised += msg.value;
        _contributions[projectId][msg.sender] += msg.value;
        _isAnonymous[projectId][msg.sender] = isAnonymous;

        emit ContributionMade(projectId, msg.sender, msg.value, isAnonymous);

        // Mint NFT to backer
        ProjectNFT nftContract = ProjectNFT(_projectNFTs[projectId]);
        uint256 tokenId = nftContract.mintToBacker(msg.sender, msg.value);

        emit NFTMinted(projectId, msg.sender, address(nftContract), tokenId, msg.value);

        // Award reputation based on amount: 1 point per 0.001 ETH (1e15 wei)
        uint256 points = msg.value / 1e15;
        if (points > 0) {
            // Tag as INVESTMENT for UI history; keep reason compact
            try reputation.awardGenesisWithCategory(
                msg.sender,
                points,
                "INVESTMENT",
                "Investment"
            ) {
                // ok
            } catch {
                // ignore failures to avoid breaking funding flow
            }
        }
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // CLAIM
    // ═════════════════════════════════════════════════════════════════════════════
    
    /**
     * @notice Claim all funds from a successful project (post-deadline)
     * @param projectId The ID of the project
     * @dev Only callable by project creator after deadline if goal is reached
     */
    function claimFunds(uint256 projectId) external nonReentrant {
        Project storage project = _projects[projectId];

        if (project.creator == address(0)) revert ProjectNotFound();
        if (msg.sender != project.creator) revert NotCreator();
        if (block.timestamp < project.deadline) revert DeadlineNotReached();
        if (project.fundsRaised < project.goal) revert GoalNotReached();
        if (project.claimed) revert AlreadyClaimed();

        project.claimed = true;
        uint256 amount = project.fundsRaised;

        emit FundsClaimed(projectId, msg.sender, amount);

        // Transfer funds to creator
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // DELETE
    // ═════════════════════════════════════════════════════════════════════════════

    /**
     * @notice Delete a project that hasn't reached its goal
     * @param projectId The ID of the project to delete
     * @dev Only callable by project creator. Cannot delete if goal was reached.
     */
    function deleteProject(uint256 projectId) external {
        Project storage project = _projects[projectId];

        if (project.creator == address(0)) revert ProjectNotFound();
        if (msg.sender != project.creator) revert NotCreator();
        if (project.fundsRaised >= project.goal) revert ProjectAlreadyFunded();

        address creator = project.creator;

        // Delete the project by resetting the creator to address(0)
        delete _projects[projectId];

        emit ProjectDeleted(projectId, creator);
    }
    
    // ═════════════════════════════════════════════════════════════════════════════
    // INSPIRE
    // ═════════════════════════════════════════════════════════════════════════════
    
    /**
     * @notice Inspire a project by giving its creator 3 reputation points
     * @param projectId The ID of the project to inspire
     * @dev Can only inspire once per project. Cannot inspire own projects.
     */
    function inspireProject(uint256 projectId) external {
        Project storage project = _projects[projectId];
        
        if (project.creator == address(0)) revert ProjectNotFound();
        if (msg.sender == project.creator) revert CannotInspireOwnProject();
        if (_hasInspired[projectId][msg.sender]) revert AlreadyInspired();
        
        // Mark as inspired
        _hasInspired[projectId][msg.sender] = true;
        
        // Award 3 reputation points to the project creator
        uint256 reputationPoints = 3;
        reputation.awardGenesisWithCategory(
            project.creator,
            reputationPoints,
            "CUSTOM",
            string(abi.encodePacked("Inspired by project #", _uint2str(projectId)))
        );
        
        emit ProjectInspired(projectId, msg.sender, project.creator, reputationPoints);
    }
    
    // Helper function to convert uint to string
    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}
