// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Reputation
 * @notice On-chain reputation protocol with two-layer architecture:
 *         Layer 1: Genesis Reputation (Medals from trusted communities)
 *         Layer 2: Peer-to-Peer Boosts (Community validation)
 * @dev Anti-manipulation by design with cooldown mechanisms
 */
contract Reputation {
    // === STATE VARIABLES ===

    /// @notice Owner of the contract (can award initial medals)
    address public owner;

    /// @notice Reputation score for each user
    mapping(address => uint256) public reputationScore;

    /// @notice Last time a user gave a boost
    mapping(address => uint256) public lastBoostTime;

    /// @notice Cooldown period between boosts (24 hours)
    uint256 public constant BOOST_COOLDOWN = 1 days;

    /// @notice Fixed amount of points transferred in a boost
    uint256 public constant BOOST_POINTS = 10;

    // === EVENTS ===

    /// @notice Emitted when medals (initial reputation) are awarded
    event MedalAwarded(address indexed recipient, uint256 points, string reason);

    /// @notice Emitted when a user boosts another user
    event BoostGiven(address indexed from, address indexed to, uint256 pointsTransferred);

    // === MODIFIERS ===

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // === CONSTRUCTOR ===

    constructor() {
        owner = msg.sender;
    }

    // === LAYER 1: GENESIS REPUTATION (TOP-DOWN) ===

    /**
     * @notice Award medals (initial reputation points) to a user
     * @dev Only owner can call this function (represents trusted communities/DAOs)
     * @param _recipient Address receiving the medal
     * @param _points Amount of reputation points to award
     * @param _reason Description of why the medal is being awarded
     */
    function awardMedal(
        address _recipient,
        uint256 _points,
        string memory _reason
    ) external onlyOwner {
        require(_recipient != address(0), "Invalid recipient address");
        require(_points > 0, "Points must be greater than zero");

        reputationScore[_recipient] += _points;

        emit MedalAwarded(_recipient, _points, _reason);
    }

    // === LAYER 2: PEER-TO-PEER BOOSTS ===

    /**
     * @notice Boost another user's reputation
     * @dev The power of your boost is proportional to your reputation score
     *      Your own score doesn't decrease - this incentivizes participation
     * @param _recipient Address to boost
     */
    function boost(address _recipient) external {
        require(_recipient != address(0), "Invalid recipient address");
        require(_recipient != msg.sender, "Cannot boost yourself");
        require(reputationScore[msg.sender] >= BOOST_POINTS, "Insufficient reputation to boost");
        require(
            block.timestamp >= lastBoostTime[msg.sender] + BOOST_COOLDOWN,
            "Cooldown period not elapsed"
        );

        // Update cooldown
        lastBoostTime[msg.sender] = block.timestamp;

        // Calculate boost power based on booster's reputation
        // Higher reputation = more powerful boosts
        uint256 boostPower = calculateBoostPower(msg.sender);

        // Transfer points to recipient
        reputationScore[_recipient] += boostPower;

        emit BoostGiven(msg.sender, _recipient, boostPower);
    }

    /**
     * @notice Calculate the power of a boost based on the booster's reputation
     * @dev Formula: base points + (reputation score / 100)
     *      This creates a scaling system where high-reputation users have more influence
     * @param _booster Address of the user giving the boost
     * @return The amount of points this boost will transfer
     */
    function calculateBoostPower(address _booster) public view returns (uint256) {
        uint256 baseBoost = BOOST_POINTS;
        uint256 bonusBoost = reputationScore[_booster] / 100;
        return baseBoost + bonusBoost;
    }

    // === VIEW FUNCTIONS ===

    /**
     * @notice Check if a user can boost right now
     * @param _user Address to check
     * @return True if the user can boost, false otherwise
     */
    function canBoost(address _user) external view returns (bool) {
        return reputationScore[_user] >= BOOST_POINTS &&
               block.timestamp >= lastBoostTime[_user] + BOOST_COOLDOWN;
    }

    /**
     * @notice Get time remaining until a user can boost again
     * @param _user Address to check
     * @return Seconds remaining (0 if can boost now)
     */
    function timeUntilNextBoost(address _user) external view returns (uint256) {
        uint256 nextBoostTime = lastBoostTime[_user] + BOOST_COOLDOWN;
        if (block.timestamp >= nextBoostTime) {
            return 0;
        }
        return nextBoostTime - block.timestamp;
    }

    /**
     * @notice Get the reputation level/tier of a user
     * @dev Levels: 0-49=Novice, 50-199=Builder, 200-499=Expert, 500+=Legend
     * @param _user Address to check
     * @return String representing the reputation tier
     */
    function getReputationLevel(address _user) external view returns (string memory) {
        uint256 score = reputationScore[_user];

        if (score >= 500) return "Legend";
        if (score >= 200) return "Expert";
        if (score >= 50) return "Builder";
        return "Novice";
    }
}
