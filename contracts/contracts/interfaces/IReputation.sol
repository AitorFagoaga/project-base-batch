// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IReputation
 * @notice Interface for the two-layer reputation protocol (Genesis + Boosts)
 */
interface IReputation {
    /// @notice Emitted when the owner awards genesis reputation to an address
    event GenesisAwarded(address indexed recipient, uint256 amount, string reason);
    
    /// @notice Emitted when a user boosts another user's reputation
    event BoostGiven(address indexed booster, address indexed recipient, uint256 power);
    
    /// @notice Emitted when reputation parameters are updated
    event ParamsUpdated(uint256 cooldown, uint256 baselinePower, uint256 minRepToBoost);

    /// @notice Returns the reputation score of an address
    function reputationOf(address account) external view returns (uint256);
    
    /// @notice Returns the timestamp of the last boost given by an address
    function lastBoostAt(address booster) external view returns (uint256);
    
    /// @notice Returns the current cooldown period in seconds
    function cooldown() external view returns (uint256);
    
    /// @notice Calculates the boost power for a given booster
    function boostPower(address booster) external view returns (uint256);
    
    /// @notice Awards genesis reputation to a single address (owner only)
    function awardGenesis(address recipient, uint256 amount, string calldata reason) external;
    
    /// @notice Awards genesis reputation to multiple addresses (owner only)
    function awardGenesisBatch(
        address[] calldata recipients,
        uint256[] calldata amounts,
        string[] calldata reasons
    ) external;
    
    /// @notice Updates reputation parameters (owner only)
    function setParams(uint256 newCooldown, uint256 newBaselinePower, uint256 newMinRepToBoost) external;
    
    /// @notice Boosts another user's reputation (P2P, with cooldown)
    function boost(address recipient) external;
}
