// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title UserProfile
 * @notice Stores user profile information (name, description, avatar)
 * @dev Users can update their own profile at any time
 */
contract UserProfile {
    struct Profile {
        string name;
        string description;
        string avatarUrl; // IPFS hash or URL
        bool exists;
    }

    // address => Profile
    mapping(address => Profile) public profiles;

    event ProfileUpdated(
        address indexed user,
        string name,
        string description,
        string avatarUrl
    );

    /**
     * @notice Set or update user profile
     * @param _name Display name (max 50 chars)
     * @param _description Bio/description (max 500 chars)
     * @param _avatarUrl IPFS URL or image link
     */
    function setProfile(
        string calldata _name,
        string calldata _description,
        string calldata _avatarUrl
    ) external {
        require(bytes(_name).length <= 50, "Name too long");
        require(bytes(_description).length <= 500, "Description too long");
        require(bytes(_avatarUrl).length <= 200, "Avatar URL too long");

        profiles[msg.sender] = Profile({
            name: _name,
            description: _description,
            avatarUrl: _avatarUrl,
            exists: true
        });

        emit ProfileUpdated(msg.sender, _name, _description, _avatarUrl);
    }

    /**
     * @notice Get profile for a user
     * @param _user Address to query
     */
    function getProfile(address _user)
        external
        view
        returns (
            string memory name,
            string memory description,
            string memory avatarUrl,
            bool exists
        )
    {
        Profile memory p = profiles[_user];
        return (p.name, p.description, p.avatarUrl, p.exists);
    }

    /**
     * @notice Check if user has a profile
     */
    function hasProfile(address _user) external view returns (bool) {
        return profiles[_user].exists;
    }
}
