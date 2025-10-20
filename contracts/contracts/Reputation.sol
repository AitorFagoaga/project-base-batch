// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IReputation.sol";

/**
 * @title Reputation
 * @notice Two-layer reputation protocol for the Meritocratic Launchpad
 * @dev Layer 1 (Genesis): Admins award reputation for verified achievements
 *      Layer 2 (Boosts): P2P reputation with sublinear power (sqrt) and cooldown
 */
contract Reputation is IReputation, AccessControl {
    // ═════════════════════════════════════════════════════════════════════════════
    // ROLES
    // ═════════════════════════════════════════════════════════════════════════════

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    // ═════════════════════════════════════════════════════════════════════════════
    // STATE
    // ═════════════════════════════════════════════════════════════════════════════

    /// @notice Reputation scores (genesis + boosts received)
    mapping(address => uint256) private _reputation;

    /// @notice Genesis reputation earned (subset of total reputation)
    mapping(address => uint256) private _genesisReputation;

    /// @notice Genesis awards history per user
    mapping(address => GenesisAward[]) private _genesisHistory;

    /// @notice Last boost timestamp for each address (cooldown tracking)
    mapping(address => uint256) private _lastBoostAt;

    /// @notice Cooldown period between boosts (in seconds)
    uint256 private _cooldown;

    /// @notice Baseline boost power (added to sqrt(rep))
    uint256 private _baselinePower;

    /// @notice Minimum reputation required to give boosts
    uint256 private _minRepToBoost;

    /// @notice Genesis award record
    struct GenesisAward {
        uint256 amount;
        string category; // "HACKATHON", "OSS", "DAO", "CUSTOM"
        string reason;
        uint256 timestamp;
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // ERRORS
    // ═════════════════════════════════════════════════════════════════════════════
    
    error CooldownNotExpired(uint256 timeRemaining);
    error InsufficientReputation(uint256 required, uint256 actual);
    error CannotBoostSelf();
    error InvalidRecipient();
    error ArrayLengthMismatch();

    // ═════════════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═════════════════════════════════════════════════════════════════════════════
    
    /**
     * @param cooldown_ Cooldown period between boosts (e.g., 86400 = 1 day)
     * @param baselinePower_ Baseline boost power (e.g., 1)
     * @param minRepToBoost_ Minimum reputation to give boosts (e.g., 0 for MVP)
     * @param initialAdmin_ Address that will be the first admin
     */
    constructor(
        uint256 cooldown_,
        uint256 baselinePower_,
        uint256 minRepToBoost_,
        address initialAdmin_
    ) {
        _cooldown = cooldown_;
        _baselinePower = baselinePower_;
        _minRepToBoost = minRepToBoost_;

        // Grant DEFAULT_ADMIN_ROLE and ADMIN_ROLE to initial admin
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin_);
        _grantRole(ADMIN_ROLE, initialAdmin_);
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═════════════════════════════════════════════════════════════════════════════
    
    /// @inheritdoc IReputation
    function reputationOf(address account) external view returns (uint256) {
        return _reputation[account];
    }

    /// @notice Get Genesis reputation (Layer 1 only)
    function genesisReputationOf(address account) external view returns (uint256) {
        return _genesisReputation[account];
    }

    /// @notice Get Boost reputation (Layer 2 only)
    function boostReputationOf(address account) external view returns (uint256) {
        return _reputation[account] - _genesisReputation[account];
    }

    /// @notice Get Genesis awards history for a user
    function getGenesisHistory(address account) external view returns (GenesisAward[] memory) {
        return _genesisHistory[account];
    }

    /// @notice Get Genesis awards count by category
    function getGenesisByCategory(address account, string calldata category) external view returns (uint256 total) {
        GenesisAward[] memory awards = _genesisHistory[account];
        for (uint256 i = 0; i < awards.length; i++) {
            if (keccak256(bytes(awards[i].category)) == keccak256(bytes(category))) {
                total += awards[i].amount;
            }
        }
        return total;
    }

    /// @inheritdoc IReputation
    function lastBoostAt(address booster) external view returns (uint256) {
        return _lastBoostAt[booster];
    }

    /// @inheritdoc IReputation
    function cooldown() external view returns (uint256) {
        return _cooldown;
    }

    /**
     * @inheritdoc IReputation
     * @dev Boost power = sqrt(reputation) + baseline
     *      Uses Babylonian method for sqrt approximation
     */
    function boostPower(address booster) public view returns (uint256) {
        uint256 rep = _reputation[booster];
        return _sqrt(rep) + _baselinePower;
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // GENESIS (OWNER ONLY)
    // ═════════════════════════════════════════════════════════════════════════════
    
    /// @inheritdoc IReputation
    function awardGenesis(
        address recipient,
        uint256 amount,
        string calldata reason
    ) external onlyRole(ADMIN_ROLE) {
        _awardGenesisWithCategory(recipient, amount, "CUSTOM", reason);
    }

    /// @notice Award genesis with specific category
    function awardGenesisWithCategory(
        address recipient,
        uint256 amount,
        string calldata category,
        string calldata reason
    ) external onlyRole(ADMIN_ROLE) {
        _awardGenesisWithCategory(recipient, amount, category, reason);
    }

    /// @inheritdoc IReputation
    function awardGenesisBatch(
        address[] calldata recipients,
        uint256[] calldata amounts,
        string[] calldata reasons
    ) external onlyRole(ADMIN_ROLE) {
        uint256 len = recipients.length;
        if (len != amounts.length || len != reasons.length) {
            revert ArrayLengthMismatch();
        }

        for (uint256 i = 0; i < len; i++) {
            _awardGenesisWithCategory(recipients[i], amounts[i], "CUSTOM", reasons[i]);
        }
    }

    /// @notice Award genesis batch with categories
    function awardGenesisBatchWithCategories(
        address[] calldata recipients,
        uint256[] calldata amounts,
        string[] calldata categories,
        string[] calldata reasons
    ) external onlyRole(ADMIN_ROLE) {
        uint256 len = recipients.length;
        if (len != amounts.length || len != categories.length || len != reasons.length) {
            revert ArrayLengthMismatch();
        }

        for (uint256 i = 0; i < len; i++) {
            _awardGenesisWithCategory(recipients[i], amounts[i], categories[i], reasons[i]);
        }
    }

    /// @dev Internal helper to award genesis
    function _awardGenesisWithCategory(
        address recipient,
        uint256 amount,
        string memory category,
        string memory reason
    ) internal {
        if (recipient == address(0)) revert InvalidRecipient();

        _reputation[recipient] += amount;
        _genesisReputation[recipient] += amount;

        _genesisHistory[recipient].push(GenesisAward({
            amount: amount,
            category: category,
            reason: reason,
            timestamp: block.timestamp
        }));

        emit GenesisAwarded(recipient, amount, reason);
    }
    
    /// @inheritdoc IReputation
    function setParams(
        uint256 newCooldown,
        uint256 newBaselinePower,
        uint256 newMinRepToBoost
    ) external onlyRole(ADMIN_ROLE) {
        _cooldown = newCooldown;
        _baselinePower = newBaselinePower;
        _minRepToBoost = newMinRepToBoost;
        emit ParamsUpdated(newCooldown, newBaselinePower, newMinRepToBoost);
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // BOOSTS (P2P)
    // ═════════════════════════════════════════════════════════════════════════════
    
    /**
     * @inheritdoc IReputation
     * @dev Checks:
     *      - Booster has minimum reputation
     *      - Cooldown has expired
     *      - Not boosting self
     *      - Recipient is valid
     */
    function boost(address recipient) external {
        if (recipient == address(0)) revert InvalidRecipient();
        if (recipient == msg.sender) revert CannotBoostSelf();
        
        uint256 boosterRep = _reputation[msg.sender];
        if (boosterRep < _minRepToBoost) {
            revert InsufficientReputation(_minRepToBoost, boosterRep);
        }
        
        uint256 lastBoost = _lastBoostAt[msg.sender];
        if (block.timestamp < lastBoost + _cooldown) {
            uint256 timeRemaining = (lastBoost + _cooldown) - block.timestamp;
            revert CooldownNotExpired(timeRemaining);
        }
        
        // Calculate and apply boost power
        uint256 power = boostPower(msg.sender);
        _reputation[recipient] += power;
        _lastBoostAt[msg.sender] = block.timestamp;
        
        emit BoostGiven(msg.sender, recipient, power);
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // INTERNAL HELPERS
    // ═════════════════════════════════════════════════════════════════════════════
    
    /**
     * @dev Babylonian method for computing sqrt
     * @param x Input value
     * @return y Square root of x
     */
    function _sqrt(uint256 x) internal pure returns (uint256 y) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
}
