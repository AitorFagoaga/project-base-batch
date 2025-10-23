// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IReputation.sol";
import "./ProjectNFT.sol";

/**
 * @title Launchpad
 * @notice Simple crowdfunding platform with reputation-based credibility
 * @dev All-or-nothing funding with refunds if goal not reached. NFTs minted only on success.
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

    struct TeamMember {
        address member;
        string role;
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

    /// @notice Mapping from project ID and address to role
    mapping(uint256 => mapping(address => string)) private _teamRoles;

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
        address indexed cofounder,
        string role
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

    event RefundProcessed(
        uint256 indexed projectId,
        address indexed backer,
        uint256 amount
    );

    event NFTsDistributed(
        uint256 indexed projectId,
        uint256 totalNFTsMinted
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
    error InvalidRole();
    error ArrayLengthMismatch();
    error NoContribution();
    error AlreadyRefunded();
    error GoalReached();

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
     * @param durationInSeconds Duration of the campaign in seconds (supports decimal days from frontend)
     * @param nftName Name for the backer NFT collection
     * @param nftSymbol Symbol for the backer NFT collection
     * @param nftBaseURI IPFS URI for the NFT metadata
     * @param creatorRole Role of the project creator
     * @return projectId The ID of the newly created project
     */
    function createProject(
        string calldata title,
        string calldata description,
        string calldata imageUrl,
        string calldata category,
        uint256 goalInWei,
        uint256 durationInSeconds,
        string calldata nftName,
        string calldata nftSymbol,
        string calldata nftBaseURI,
        string calldata creatorRole
    ) external returns (uint256 projectId) {
        if (goalInWei == 0) revert InvalidGoal();
        if (durationInSeconds == 0) revert InvalidDuration();
        if (durationInSeconds > 365 days) revert InvalidDuration(); // Max 365 days

        uint256 deadline = block.timestamp + durationInSeconds;
        projectId = _projectIdCounter++;

        ProjectNFT nftContract = new ProjectNFT(nftName, nftSymbol, nftBaseURI, address(this));

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
        _teamRoles[projectId][msg.sender] = creatorRole;

        emit ProjectCreated(projectId, msg.sender, title, description, imageUrl, category, goalInWei, deadline);
    }
    
    /**
     * @notice Add a co-founder to the project
     * @param projectId The ID of the project
     * @param cofounder Address of the co-founder to add
     * @param role Role of the co-founder
     */
    function addCofounder(uint256 projectId, address cofounder, string calldata role) external {
        Project storage project = _projects[projectId];
        if (project.creator == address(0)) revert ProjectNotFound();
        if (msg.sender != project.creator) revert NotCreator();
        if (_isCofounder[projectId][cofounder]) revert AlreadyCofounder();
        if (cofounder == project.creator) revert AlreadyCofounder();
        if (bytes(role).length == 0) revert InvalidRole();

        require(bytes(role).length <= 50, "Role too long");

        project.cofounders.push(cofounder);
        _isCofounder[projectId][cofounder] = true;
        _teamRoles[projectId][cofounder] = role;

        emit CofounderAdded(projectId, cofounder, role);
    }

    /**
     * @notice Add multiple co-founders to the project in a single transaction
     * @param projectId The ID of the project
     * @param cofounders Array of co-founder addresses
     * @param roles Array of roles corresponding to each co-founder
     */
    function addCofoundersBatch(
        uint256 projectId,
        address[] calldata cofounders,
        string[] calldata roles
    ) external {
        Project storage project = _projects[projectId];
        if (project.creator == address(0)) revert ProjectNotFound();
        if (msg.sender != project.creator) revert NotCreator();
        if (cofounders.length != roles.length) revert ArrayLengthMismatch();

        for (uint256 i = 0; i < cofounders.length; i++) {
            address cofounder = cofounders[i];
            string calldata role = roles[i];

            // Skip if already a cofounder
            if (_isCofounder[projectId][cofounder]) continue;

            // Skip if it's the creator
            if (cofounder == project.creator) continue;

            // Validate role
            if (bytes(role).length == 0) revert InvalidRole();
            require(bytes(role).length <= 50, "Role too long");

            // Add cofounder
            project.cofounders.push(cofounder);
            _isCofounder[projectId][cofounder] = true;
            _teamRoles[projectId][cofounder] = role;

            emit CofounderAdded(projectId, cofounder, role);
        }
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

    /**
     * @notice Get the role of a team member (creator or cofounder)
     * @param projectId The ID of the project
     * @param member Address of the team member
     * @return The role string
     */
    function getTeamMemberRole(uint256 projectId, address member) external view returns (string memory) {
        return _teamRoles[projectId][member];
    }

    /**
     * @notice Get all team members with their roles
     * @param projectId The ID of the project
     * @return Array of TeamMember structs containing addresses and roles
     */
    function getTeamMembers(uint256 projectId) external view returns (TeamMember[] memory) {
        Project storage project = _projects[projectId];
        uint256 teamSize = 1 + project.cofounders.length; // creator + cofounders
        TeamMember[] memory team = new TeamMember[](teamSize);

        // Add creator
        team[0] = TeamMember({
            member: project.creator,
            role: _teamRoles[projectId][project.creator]
        });

        // Add cofounders
        for (uint256 i = 0; i < project.cofounders.length; i++) {
            team[i + 1] = TeamMember({
                member: project.cofounders[i],
                role: _teamRoles[projectId][project.cofounders[i]]
            });
        }

        return team;
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // FUNDING
    // ═════════════════════════════════════════════════════════════════════════════
    
    /**
     * @notice Fund a project with ETH
     * @param projectId The ID of the project to fund
     * @param isAnonymous Whether to keep the contribution anonymous
     * @dev NFTs are NOT minted immediately - they're minted when project succeeds
     */
    function fundProject(uint256 projectId, bool isAnonymous) external payable {
        if (msg.value == 0) revert ZeroContribution();

        Project storage project = _projects[projectId];
        if (project.creator == address(0)) revert ProjectNotFound();
        if (block.timestamp >= project.deadline) revert DeadlinePassed();
        if (msg.sender == project.creator) revert CannotFundOwnProject();
        if (_isCofounder[projectId][msg.sender]) revert CannotFundOwnProject();

        // Track first-time contributor
        if (_contributions[projectId][msg.sender] == 0) {
            _contributors[projectId].push(msg.sender);
        }

        project.fundsRaised += msg.value;
        _contributions[projectId][msg.sender] += msg.value;
        _isAnonymous[projectId][msg.sender] = isAnonymous;

        emit ContributionMade(projectId, msg.sender, msg.value, isAnonymous);

        // NOTE: NFTs will be minted only if project reaches its goal
        // When creator calls claimFunds(), NFTs are distributed to all backers
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // CLAIM
    // ═════════════════════════════════════════════════════════════════════════════
    
    /**
     * @notice Finalize a project after deadline - either claim funds or process refunds
     * @param projectId The ID of the project
     * @dev Can be called by anyone after deadline
     * @dev If goal reached: transfers funds to creator and distributes NFTs/reputation
     * @dev If goal NOT reached: automatically refunds all contributors
     */
    function finalizeProject(uint256 projectId) external nonReentrant {
        Project storage project = _projects[projectId];

        if (project.creator == address(0)) revert ProjectNotFound();
        if (block.timestamp < project.deadline) revert DeadlineNotReached();
        if (project.claimed) revert AlreadyClaimed();

        project.claimed = true;

        // Goal reached: transfer to creator and distribute NFTs
        if (project.fundsRaised >= project.goal) {
            uint256 amount = project.fundsRaised;

            // Distribute NFTs and reputation to all backers
            _distributeNFTsAndReputation(projectId);

            emit FundsClaimed(projectId, project.creator, amount);

            // Transfer funds to creator
            (bool success, ) = payable(project.creator).call{value: amount}("");
            if (!success) revert TransferFailed();
        } 
        // Goal NOT reached: refund all contributors
        else {
            address[] memory contributors = _contributors[projectId];
            
            for (uint256 i = 0; i < contributors.length; i++) {
                address contributor = contributors[i];
                uint256 contribution = _contributions[projectId][contributor];
                
                if (contribution > 0) {
                    _contributions[projectId][contributor] = 0;
                    
                    emit RefundProcessed(projectId, contributor, contribution);
                    
                    (bool success, ) = payable(contributor).call{value: contribution}("");
                    if (!success) {
                        // Restore contribution so they can claim manually
                        _contributions[projectId][contributor] = contribution;
                    }
                }
            }
        }
    }
    
    /**
     * @notice Claim all funds from a successful project (post-deadline)
     * @param projectId The ID of the project
     * @dev Only callable by project creator after deadline if goal is reached
     * @dev This also mints NFTs to all backers and awards reputation
     * @dev DEPRECATED: Use finalizeProject() instead
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

        // Distribute NFTs and reputation to all backers
        _distributeNFTsAndReputation(projectId);

        emit FundsClaimed(projectId, msg.sender, amount);

        // Transfer funds to creator
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();
    }

    /**
     * @notice Internal function to distribute NFTs and reputation to backers
     * @param projectId The ID of the project
     */
    function _distributeNFTsAndReputation(uint256 projectId) internal {
        address[] memory contributors = _contributors[projectId];
        uint256 nftsMinted = 0;

        for (uint256 i = 0; i < contributors.length; i++) {
            if (_contributions[projectId][contributors[i]] > 0) {
                // Mint NFT with investment amount
                uint256 tokenId = ProjectNFT(_projectNFTs[projectId]).mintToBacker(
                    contributors[i], 
                    _contributions[projectId][contributors[i]]
                );
                emit NFTMinted(projectId, contributors[i], _projectNFTs[projectId], tokenId, _contributions[projectId][contributors[i]]);
                nftsMinted++;

                // Award reputation: 1 point per 0.001 ETH (1e15 wei)
                uint256 points = _contributions[projectId][contributors[i]] / 1e15;
                if (points > 0) {
                    try reputation.awardGenesisWithCategory(
                        contributors[i],
                        points,
                        "INVESTMENT",
                        "Successful project backing"
                    ) {} catch {}
                }
            }
        }

        emit NFTsDistributed(projectId, nftsMinted);
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // REFUND
    // ═════════════════════════════════════════════════════════════════════════════

    /**
     * @notice Process all refunds for a failed project
     * @param projectId The ID of the project
     * @dev Only callable after deadline if goal was NOT reached
     * @dev Automatically refunds all contributors
     */
    function processRefunds(uint256 projectId) external nonReentrant {
        Project storage project = _projects[projectId];

        if (project.creator == address(0)) revert ProjectNotFound();
        if (block.timestamp < project.deadline) revert DeadlineNotReached();
        if (project.fundsRaised >= project.goal) revert GoalReached();
        if (project.claimed) revert AlreadyClaimed(); // Prevent double processing

        project.claimed = true; // Mark as processed

        address[] memory contributors = _contributors[projectId];
        
        for (uint256 i = 0; i < contributors.length; i++) {
            address contributor = contributors[i];
            uint256 contribution = _contributions[projectId][contributor];
            
            if (contribution > 0) {
                _contributions[projectId][contributor] = 0;
                
                emit RefundProcessed(projectId, contributor, contribution);
                
                (bool success, ) = payable(contributor).call{value: contribution}("");
                // Continue even if one transfer fails (shouldn't happen but safety first)
                if (!success) {
                    // Restore contribution so they can claim manually
                    _contributions[projectId][contributor] = contribution;
                }
            }
        }
    }

    /**
     * @notice Claim refund if project didn't reach its goal after deadline
     * @param projectId The ID of the project
     * @dev Only callable after deadline if goal was NOT reached
     * @dev Fallback for individual refund claims if batch processing wasn't done
     */
    function claimRefund(uint256 projectId) external nonReentrant {
        Project storage project = _projects[projectId];

        if (project.creator == address(0)) revert ProjectNotFound();
        if (block.timestamp < project.deadline) revert DeadlineNotReached();
        if (project.fundsRaised >= project.goal) revert GoalReached();
        
        uint256 contribution = _contributions[projectId][msg.sender];
        if (contribution == 0) revert NoContribution();

        // Mark as refunded
        _contributions[projectId][msg.sender] = 0;

        emit RefundProcessed(projectId, msg.sender, contribution);

        // Transfer refund to backer
        (bool success, ) = payable(msg.sender).call{value: contribution}("");
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
