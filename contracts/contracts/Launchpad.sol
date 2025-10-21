// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IReputation.sol";

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
        uint256 goal; // in wei
        uint256 deadline; // timestamp
        uint256 fundsRaised;
        bool claimed;
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

    // ═════════════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═════════════════════════════════════════════════════════════════════════════
    
    event ProjectCreated(
        uint256 indexed projectId,
        address indexed creator,
        string title,
        string description,
        string imageUrl,
        uint256 goal,
        uint256 deadline
    );
    
    event ContributionMade(
        uint256 indexed projectId,
        address indexed backer,
        uint256 amount
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

    // ═════════════════════════════════════════════════════════════════════════════
    // PROJECT CREATION
    // ═════════════════════════════════════════════════════════════════════════════
    
    /**
     * @notice Creates a new crowdfunding project
     * @param title Project title
     * @param description Project description
     * @param imageUrl Project image URL
     * @param goal Funding goal in wei
     * @param durationInDays Duration of the campaign in days
     * @return projectId The ID of the newly created project
     */
    function createProject(
        string calldata title,
        string calldata description,
        string calldata imageUrl,
        uint256 goal,
        uint256 durationInDays
    ) external returns (uint256 projectId) {
        if (goal == 0) revert InvalidGoal();
        if (durationInDays == 0) revert InvalidDuration();

        uint256 deadline = block.timestamp + (durationInDays * 1 days);

        projectId = _projectIdCounter++;

        _projects[projectId] = Project({
            id: projectId,
            creator: msg.sender,
            title: title,
            description: description,
            imageUrl: imageUrl,
            goal: goal,
            deadline: deadline,
            fundsRaised: 0,
            claimed: false
        });

        emit ProjectCreated(projectId, msg.sender, title, description, imageUrl, goal, deadline);
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // FUNDING
    // ═════════════════════════════════════════════════════════════════════════════
    
    /**
     * @notice Fund a project with ETH
     * @param projectId The ID of the project to fund
     */
    function fundProject(uint256 projectId) external payable {
        if (msg.value == 0) revert ZeroContribution();
        
        Project storage project = _projects[projectId];
        if (project.creator == address(0)) revert ProjectNotFound();
        if (block.timestamp >= project.deadline) revert DeadlinePassed();
        
        project.fundsRaised += msg.value;
        _contributions[projectId][msg.sender] += msg.value;
        
        emit ContributionMade(projectId, msg.sender, msg.value);
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
}
