// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Launchpad
 * @notice Simple and secure crowdfunding platform for Web3 projects
 * @dev Works in conjunction with Reputation.sol - frontend reads reputation scores
 *      to display trust metrics for each project creator
 */
contract Launchpad {
    // === STATE VARIABLES ===

    /// @notice Project structure containing all campaign details
    struct Project {
        uint256 id;
        address creator;
        string title;
        string description;
        uint256 fundingGoal;    // In wei
        uint256 deadline;       // Unix timestamp
        uint256 fundsRaised;
        bool claimed;
        bool exists;
    }

    /// @notice Mapping from project ID to Project data
    mapping(uint256 => Project) public projects;

    /// @notice Mapping from project ID to backer address to contribution amount
    mapping(uint256 => mapping(address => uint256)) public contributions;

    /// @notice Counter for generating unique project IDs
    uint256 public projectCounter;

    // === EVENTS ===

    event ProjectCreated(
        uint256 indexed id,
        address indexed creator,
        string title,
        uint256 fundingGoal,
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

    // === FUNCTIONS ===

    /**
     * @notice Create a new crowdfunding project
     * @param _title Project title
     * @param _description Project description
     * @param _fundingGoalInEth Funding goal in ETH (will be converted to wei)
     * @param _durationInDays Campaign duration in days
     */
    function createProject(
        string memory _title,
        string memory _description,
        uint256 _fundingGoalInEth,
        uint256 _durationInDays
    ) external {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_fundingGoalInEth > 0, "Funding goal must be greater than zero");
        require(_durationInDays > 0 && _durationInDays <= 90, "Duration must be between 1 and 90 days");

        uint256 fundingGoalInWei = _fundingGoalInEth * 1 ether;
        uint256 deadline = block.timestamp + (_durationInDays * 1 days);

        projects[projectCounter] = Project({
            id: projectCounter,
            creator: msg.sender,
            title: _title,
            description: _description,
            fundingGoal: fundingGoalInWei,
            deadline: deadline,
            fundsRaised: 0,
            claimed: false,
            exists: true
        });

        emit ProjectCreated(
            projectCounter,
            msg.sender,
            _title,
            fundingGoalInWei,
            deadline
        );

        projectCounter++;
    }

    /**
     * @notice Fund a project with ETH
     * @dev Function is payable to receive ETH
     * @param _projectId ID of the project to fund
     */
    function fundProject(uint256 _projectId) external payable {
        Project storage project = projects[_projectId];

        require(project.exists, "Project does not exist");
        require(block.timestamp < project.deadline, "Funding deadline has passed");
        require(msg.value > 0, "Contribution must be greater than zero");
        require(!project.claimed, "Funds already claimed");

        project.fundsRaised += msg.value;
        contributions[_projectId][msg.sender] += msg.value;

        emit ContributionMade(_projectId, msg.sender, msg.value);
    }

    /**
     * @notice Claim funds if the project reached its goal
     * @dev Only callable by the project creator after deadline if goal was reached
     * @param _projectId ID of the project
     */
    function claimFunds(uint256 _projectId) external {
        Project storage project = projects[_projectId];

        require(project.exists, "Project does not exist");
        require(msg.sender == project.creator, "Only creator can claim funds");
        require(block.timestamp >= project.deadline, "Project is still active");
        require(project.fundsRaised >= project.fundingGoal, "Funding goal not reached");
        require(!project.claimed, "Funds already claimed");

        project.claimed = true;

        // Transfer funds to creator
        (bool success, ) = payable(project.creator).call{value: project.fundsRaised}("");
        require(success, "Transfer failed");

        emit FundsClaimed(_projectId, project.creator, project.fundsRaised);
    }

    // === VIEW FUNCTIONS ===

    /**
     * @notice Get project details
     * @param _projectId ID of the project
     * @return Project struct with all details
     */
    function getProject(uint256 _projectId) external view returns (Project memory) {
        require(projects[_projectId].exists, "Project does not exist");
        return projects[_projectId];
    }

    /**
     * @notice Check if a project is active (can still receive contributions)
     * @param _projectId ID of the project
     * @return True if project is active, false otherwise
     */
    function isProjectActive(uint256 _projectId) external view returns (bool) {
        Project storage project = projects[_projectId];
        return project.exists &&
               block.timestamp < project.deadline &&
               !project.claimed;
    }

    /**
     * @notice Check if a project reached its funding goal
     * @param _projectId ID of the project
     * @return True if goal reached, false otherwise
     */
    function isGoalReached(uint256 _projectId) external view returns (bool) {
        Project storage project = projects[_projectId];
        return project.exists && project.fundsRaised >= project.fundingGoal;
    }

    /**
     * @notice Get contribution amount for a specific backer on a project
     * @param _projectId ID of the project
     * @param _backer Address of the backer
     * @return Amount contributed in wei
     */
    function getContribution(uint256 _projectId, address _backer) external view returns (uint256) {
        return contributions[_projectId][_backer];
    }

    /**
     * @notice Get percentage of funding goal reached
     * @param _projectId ID of the project
     * @return Percentage (0-100+)
     */
    function getFundingPercentage(uint256 _projectId) external view returns (uint256) {
        Project storage project = projects[_projectId];
        require(project.exists, "Project does not exist");

        if (project.fundingGoal == 0) return 0;
        return (project.fundsRaised * 100) / project.fundingGoal;
    }
}
