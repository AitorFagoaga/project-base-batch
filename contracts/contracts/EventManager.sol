// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title EventManager
 * @notice On-chain registry for community events and event medals (badges)
 *         - Users submit events (pending)
 *         - Global admins approve or reject events
 *         - Approved events can define medals that attendees can claim by scanning a QR link
 *         - Event creators can also manually award medals to specific addresses
 *
 * MVP choices:
 *  - Medal claiming is permissionless for approved medals (no signature). Admins can cap with maxClaims.
 *  - Global admin role controls event approvals.
 */
contract EventManager is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    enum Status { None, Pending, Approved, Rejected }

    struct EventData {
        uint256 id;
        address creator; // event admin/owner
        string title;
        string description;
        string location; // physical address or "virtual"
        uint64 datetime; // unix timestamp (UTC)
        string timeText; // optional display time string (e.g. "18:00-20:00 UTC")
        Status status;
        string rejectReason;
    }

    struct Medal {
        uint256 id; // global medal id
        uint256 eventId;
        string name;
        string description;
        string iconUrl; // image/icon URL for UI
        uint32 points;      // optional reputation points for display only
        uint32 maxClaims;   // 0 = unlimited
        uint32 claimsCount; // number of successful claims
        bool active;        // medal enabled
    }

    // events
    uint256 public eventCount;
    mapping(uint256 => EventData) private _events;

    // medals (global id sequencing to simplify lookups)
    uint256 public medalCount;
    mapping(uint256 => Medal) private _medals; // medalId => Medal
    mapping(uint256 => uint256[]) private _eventMedals; // eventId => medalIds

    // claims: medalId => claimer => claimed
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

    // -------- Events --------
    event EventSubmitted(uint256 indexed eventId, address indexed creator);
    event EventApproved(uint256 indexed eventId, address indexed admin);
    event EventRejected(uint256 indexed eventId, address indexed admin, string reason);
    event MedalCreated(uint256 indexed eventId, uint256 indexed medalId, string name);
    event MedalClaimed(uint256 indexed eventId, uint256 indexed medalId, address indexed claimer);
    event MedalAwarded(uint256 indexed eventId, uint256 indexed medalId, address indexed recipient, address by);

    constructor(address initialAdmin) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        if (initialAdmin != address(0)) {
            _grantRole(ADMIN_ROLE, initialAdmin);
        }
    }

    // -------- Admin helpers --------
    function grantAdmin(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(ADMIN_ROLE, account);
    }

    function revokeAdmin(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(ADMIN_ROLE, account);
    }

    // -------- User actions --------
    /**
     * @notice Submit a new event. Status becomes Pending.
     * @param title Title
     * @param description Description
     * @param location Location text (physical or virtual)
     * @param datetime Unix timestamp (UTC)
     * @param timeText Display time string
     * @param medalNames Medal names
     * @param medalDescriptions Medal descriptions
     * @param medalPoints Display-only points per medal (optional use in frontend)
     * @param medalMaxClaims Max claims per medal (0 = unlimited)
     */
    function submitEvent(
        string calldata title,
        string calldata description,
        string calldata location,
        uint64 datetime,
        string calldata timeText,
        string[] calldata medalNames,
        string[] calldata medalDescriptions,
        string[] calldata medalIcons,
        uint32[] calldata medalPoints,
        uint32[] calldata medalMaxClaims
    ) external returns (uint256) {
        require(bytes(title).length > 0, "Title required");
        require(datetime > 0, "Datetime required");

        uint256 id = ++eventCount;
        _events[id] = EventData({
            id: id,
            creator: msg.sender,
            title: title,
            description: description,
            location: location,
            datetime: datetime,
            timeText: timeText,
            status: Status.Pending,
            rejectReason: ""
        });

        // Create medals
        uint256 len = medalNames.length;
        require(
            len == medalDescriptions.length && len == medalIcons.length && len == medalPoints.length && len == medalMaxClaims.length,
            "Medal array length mismatch"
        );
        for (uint256 i = 0; i < len; i++) {
            uint256 mId = ++medalCount;
            _medals[mId] = Medal({
                id: mId,
                eventId: id,
                name: medalNames[i],
                description: medalDescriptions[i],
                iconUrl: medalIcons[i],
                points: medalPoints[i],
                maxClaims: medalMaxClaims[i],
                claimsCount: 0,
                active: true
            });
            _eventMedals[id].push(mId);
            emit MedalCreated(id, mId, medalNames[i]);
        }

        emit EventSubmitted(id, msg.sender);
        return id;
    }

    // -------- Admin actions --------
    function approveEvent(uint256 eventId) external onlyRole(ADMIN_ROLE) {
        EventData storage ev = _events[eventId];
        require(ev.id != 0, "Event not found");
        ev.status = Status.Approved;
        ev.rejectReason = "";
        emit EventApproved(eventId, msg.sender);
    }

    function rejectEvent(uint256 eventId, string calldata reason) external onlyRole(ADMIN_ROLE) {
        EventData storage ev = _events[eventId];
        require(ev.id != 0, "Event not found");
        ev.status = Status.Rejected;
        ev.rejectReason = reason;
        emit EventRejected(eventId, msg.sender, reason);
    }

    // Event creator controls medal activity and manual awards
    function setMedalActive(uint256 medalId, bool active) external {
        Medal storage m = _medals[medalId];
        require(m.id != 0, "Medal not found");
        require(_events[m.eventId].creator == msg.sender, "Only event creator");
        m.active = active;
    }

    function awardMedal(uint256 medalId, address to) external {
        Medal storage m = _medals[medalId];
        require(m.id != 0, "Medal not found");
        EventData storage ev = _events[m.eventId];
        require(ev.creator == msg.sender, "Only event creator");
        require(ev.status == Status.Approved, "Event not approved");
        require(!hasClaimed[medalId][to], "Already claimed");
        if (m.maxClaims > 0) {
            require(m.claimsCount < m.maxClaims, "Max claims reached");
        }
        hasClaimed[medalId][to] = true;
        m.claimsCount += 1;
        emit MedalAwarded(m.eventId, medalId, to, msg.sender);
    }

    // -------- Claims --------
    function claimMedal(uint256 medalId) external {
        Medal storage m = _medals[medalId];
        require(m.id != 0, "Medal not found");
        EventData storage ev = _events[m.eventId];
        require(ev.status == Status.Approved, "Event not approved");
        require(m.active, "Medal inactive");
        require(!hasClaimed[medalId][msg.sender], "Already claimed");
        if (m.maxClaims > 0) {
            require(m.claimsCount < m.maxClaims, "Max claims reached");
        }
        hasClaimed[medalId][msg.sender] = true;
        m.claimsCount += 1;
        emit MedalClaimed(m.eventId, medalId, msg.sender);
    }

    // -------- Views --------
    function getEvent(uint256 eventId) external view returns (EventData memory) {
        return _events[eventId];
    }

    function getEventMedals(uint256 eventId) external view returns (Medal[] memory) {
        uint256[] storage ids = _eventMedals[eventId];
        Medal[] memory arr = new Medal[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            arr[i] = _medals[ids[i]];
        }
        return arr;
    }

    function getMedal(uint256 medalId) external view returns (Medal memory) {
        return _medals[medalId];
    }
}
