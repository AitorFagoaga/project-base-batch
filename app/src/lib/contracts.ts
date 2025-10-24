/**
 * Contract addresses and ABIs for Base Sepolia deployment
 * Auto-generated from /deployments/base-sepolia.json
 * Last updated: 2025-10-24T02:54:13.515Z
 */

export const CONTRACTS = {
  projectNFT: {
    // This is a template ABI - actual NFT contract addresses are created per project
    address: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    abi: [
  {
    "type": "function",
    "name": "mintToBacker",
    "inputs": [
      {
        "name": "backer",
        "type": "address"
      },
      {
        "name": "investmentAmount",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getInvestmentAmount",
    "inputs": [
      {
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "totalSupply",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "baseURI",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "tokensOfOwner",
    "inputs": [
      {
        "name": "owner",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "ownerOf",
    "inputs": [
      {
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "tokenURI",
    "inputs": [
      {
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "NFTMinted",
    "inputs": [
      {
        "name": "backer",
        "type": "address",
        "indexed": true
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "indexed": true
      },
      {
        "name": "investmentAmount",
        "type": "uint256",
        "indexed": false
      }
    ]
  }
] as const,
  },
  reputation: {
    address: "0x3f0069eBEEc6F1f797048a035BfedC61F5F4f81d" as `0x${string}`,
    abi: [
  {
    "type": "constructor",
    "stateMutability": "undefined",
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "cooldown_"
      },
      {
        "type": "uint256",
        "name": "baselinePower_"
      },
      {
        "type": "uint256",
        "name": "minRepToBoost_"
      },
      {
        "type": "address",
        "name": "initialAdmin_"
      }
    ]
  },
  {
    "type": "error",
    "name": "AccessControlBadConfirmation",
    "inputs": []
  },
  {
    "type": "error",
    "name": "AccessControlUnauthorizedAccount",
    "inputs": [
      {
        "type": "address",
        "name": "account"
      },
      {
        "type": "bytes32",
        "name": "neededRole"
      }
    ]
  },
  {
    "type": "error",
    "name": "ArrayLengthMismatch",
    "inputs": []
  },
  {
    "type": "error",
    "name": "CannotBoostSelf",
    "inputs": []
  },
  {
    "type": "error",
    "name": "CooldownNotExpired",
    "inputs": [
      {
        "type": "uint256",
        "name": "timeRemaining"
      }
    ]
  },
  {
    "type": "error",
    "name": "InsufficientReputation",
    "inputs": [
      {
        "type": "uint256",
        "name": "required"
      },
      {
        "type": "uint256",
        "name": "actual"
      }
    ]
  },
  {
    "type": "error",
    "name": "InvalidRecipient",
    "inputs": []
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "BoostGiven",
    "inputs": [
      {
        "type": "address",
        "name": "booster",
        "indexed": true
      },
      {
        "type": "address",
        "name": "recipient",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "power",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "GenesisAwarded",
    "inputs": [
      {
        "type": "address",
        "name": "recipient",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "amount",
        "indexed": false
      },
      {
        "type": "string",
        "name": "reason",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "ParamsUpdated",
    "inputs": [
      {
        "type": "uint256",
        "name": "cooldown",
        "indexed": false
      },
      {
        "type": "uint256",
        "name": "baselinePower",
        "indexed": false
      },
      {
        "type": "uint256",
        "name": "minRepToBoost",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "RoleAdminChanged",
    "inputs": [
      {
        "type": "bytes32",
        "name": "role",
        "indexed": true
      },
      {
        "type": "bytes32",
        "name": "previousAdminRole",
        "indexed": true
      },
      {
        "type": "bytes32",
        "name": "newAdminRole",
        "indexed": true
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "RoleGranted",
    "inputs": [
      {
        "type": "bytes32",
        "name": "role",
        "indexed": true
      },
      {
        "type": "address",
        "name": "account",
        "indexed": true
      },
      {
        "type": "address",
        "name": "sender",
        "indexed": true
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "RoleRevoked",
    "inputs": [
      {
        "type": "bytes32",
        "name": "role",
        "indexed": true
      },
      {
        "type": "address",
        "name": "account",
        "indexed": true
      },
      {
        "type": "address",
        "name": "sender",
        "indexed": true
      }
    ]
  },
  {
    "type": "function",
    "name": "ADMIN_ROLE",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "bytes32",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "DEFAULT_ADMIN_ROLE",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "bytes32",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "awardGenesis",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "recipient"
      },
      {
        "type": "uint256",
        "name": "amount"
      },
      {
        "type": "string",
        "name": "reason"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "awardGenesisBatch",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "address[]",
        "name": "recipients"
      },
      {
        "type": "uint256[]",
        "name": "amounts"
      },
      {
        "type": "string[]",
        "name": "reasons"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "awardGenesisBatchWithCategories",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "address[]",
        "name": "recipients"
      },
      {
        "type": "uint256[]",
        "name": "amounts"
      },
      {
        "type": "string[]",
        "name": "categories"
      },
      {
        "type": "string[]",
        "name": "reasons"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "awardGenesisWithCategory",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "recipient"
      },
      {
        "type": "uint256",
        "name": "amount"
      },
      {
        "type": "string",
        "name": "category"
      },
      {
        "type": "string",
        "name": "reason"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "boost",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "recipient"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "boostPower",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "booster"
      }
    ],
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "boostReputationOf",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "account"
      }
    ],
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "cooldown",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "genesisReputationOf",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "account"
      }
    ],
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "getGenesisByCategory",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "account"
      },
      {
        "type": "string",
        "name": "category"
      }
    ],
    "outputs": [
      {
        "type": "uint256",
        "name": "total"
      }
    ]
  },
  {
    "type": "function",
    "name": "getGenesisHistory",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "account"
      }
    ],
    "outputs": [
      {
        "type": "tuple[]",
        "name": "",
        "components": [
          {
            "type": "uint256",
            "name": "amount"
          },
          {
            "type": "string",
            "name": "category"
          },
          {
            "type": "string",
            "name": "reason"
          },
          {
            "type": "uint256",
            "name": "timestamp"
          }
        ]
      }
    ]
  },
  {
    "type": "function",
    "name": "getRoleAdmin",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "bytes32",
        "name": "role"
      }
    ],
    "outputs": [
      {
        "type": "bytes32",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "grantRole",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "bytes32",
        "name": "role"
      },
      {
        "type": "address",
        "name": "account"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "hasRole",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "bytes32",
        "name": "role"
      },
      {
        "type": "address",
        "name": "account"
      }
    ],
    "outputs": [
      {
        "type": "bool",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "lastBoostAt",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "booster"
      }
    ],
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "renounceRole",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "bytes32",
        "name": "role"
      },
      {
        "type": "address",
        "name": "callerConfirmation"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "reputationOf",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "account"
      }
    ],
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "revokeRole",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "bytes32",
        "name": "role"
      },
      {
        "type": "address",
        "name": "account"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "setParams",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "newCooldown"
      },
      {
        "type": "uint256",
        "name": "newBaselinePower"
      },
      {
        "type": "uint256",
        "name": "newMinRepToBoost"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "supportsInterface",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "bytes4",
        "name": "interfaceId"
      }
    ],
    "outputs": [
      {
        "type": "bool",
        "name": ""
      }
    ]
  }
] as const,
  },
  launchpad: {
    address: "0x4EEc1C2F03A5B97A01949821981F20eFf0e50370" as `0x${string}`,
    abi: [
  {
    "type": "constructor",
    "stateMutability": "undefined",
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "reputationAddress"
      }
    ]
  },
  {
    "type": "error",
    "name": "AlreadyClaimed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "AlreadyCofounder",
    "inputs": []
  },
  {
    "type": "error",
    "name": "AlreadyInspired",
    "inputs": []
  },
  {
    "type": "error",
    "name": "AlreadyRefunded",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ArrayLengthMismatch",
    "inputs": []
  },
  {
    "type": "error",
    "name": "CannotFundOwnProject",
    "inputs": []
  },
  {
    "type": "error",
    "name": "CannotInspireOwnProject",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DeadlineNotReached",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DeadlinePassed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "GoalNotReached",
    "inputs": []
  },
  {
    "type": "error",
    "name": "GoalReached",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidDuration",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidGoal",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidRole",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NoContribution",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotCreator",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotCreatorOrCofounder",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ProjectAlreadyFunded",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ProjectNotFound",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ReentrancyGuardReentrantCall",
    "inputs": []
  },
  {
    "type": "error",
    "name": "TransferFailed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ZeroContribution",
    "inputs": []
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "CofounderAdded",
    "inputs": [
      {
        "type": "uint256",
        "name": "projectId",
        "indexed": true
      },
      {
        "type": "address",
        "name": "cofounder",
        "indexed": true
      },
      {
        "type": "string",
        "name": "role",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "ContributionMade",
    "inputs": [
      {
        "type": "uint256",
        "name": "projectId",
        "indexed": true
      },
      {
        "type": "address",
        "name": "backer",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "amount",
        "indexed": false
      },
      {
        "type": "bool",
        "name": "isAnonymous",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "FundsClaimed",
    "inputs": [
      {
        "type": "uint256",
        "name": "projectId",
        "indexed": true
      },
      {
        "type": "address",
        "name": "creator",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "amount",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "NFTMinted",
    "inputs": [
      {
        "type": "uint256",
        "name": "projectId",
        "indexed": true
      },
      {
        "type": "address",
        "name": "backer",
        "indexed": true
      },
      {
        "type": "address",
        "name": "nftContract",
        "indexed": false
      },
      {
        "type": "uint256",
        "name": "tokenId",
        "indexed": false
      },
      {
        "type": "uint256",
        "name": "investmentAmount",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "NFTsDistributed",
    "inputs": [
      {
        "type": "uint256",
        "name": "projectId",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "totalNFTsMinted",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "ProjectCreated",
    "inputs": [
      {
        "type": "uint256",
        "name": "projectId",
        "indexed": true
      },
      {
        "type": "address",
        "name": "creator",
        "indexed": true
      },
      {
        "type": "string",
        "name": "title",
        "indexed": false
      },
      {
        "type": "string",
        "name": "description",
        "indexed": false
      },
      {
        "type": "string",
        "name": "imageUrl",
        "indexed": false
      },
      {
        "type": "string",
        "name": "category",
        "indexed": false
      },
      {
        "type": "uint256",
        "name": "goal",
        "indexed": false
      },
      {
        "type": "uint256",
        "name": "deadline",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "ProjectDeleted",
    "inputs": [
      {
        "type": "uint256",
        "name": "projectId",
        "indexed": true
      },
      {
        "type": "address",
        "name": "creator",
        "indexed": true
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "ProjectInspired",
    "inputs": [
      {
        "type": "uint256",
        "name": "projectId",
        "indexed": true
      },
      {
        "type": "address",
        "name": "inspirer",
        "indexed": true
      },
      {
        "type": "address",
        "name": "creator",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "reputationAwarded",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "RefundProcessed",
    "inputs": [
      {
        "type": "uint256",
        "name": "projectId",
        "indexed": true
      },
      {
        "type": "address",
        "name": "backer",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "amount",
        "indexed": false
      }
    ]
  },
  {
    "type": "function",
    "name": "addCofounder",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "projectId"
      },
      {
        "type": "address",
        "name": "cofounder"
      },
      {
        "type": "string",
        "name": "role"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "addCofoundersBatch",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "projectId"
      },
      {
        "type": "address[]",
        "name": "cofounders"
      },
      {
        "type": "string[]",
        "name": "roles"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "claimFunds",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "projectId"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "claimRefund",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "projectId"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "createProject",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "string",
        "name": "title"
      },
      {
        "type": "string",
        "name": "description"
      },
      {
        "type": "string",
        "name": "imageUrl"
      },
      {
        "type": "string",
        "name": "category"
      },
      {
        "type": "uint256",
        "name": "goalInWei"
      },
      {
        "type": "uint256",
        "name": "durationInSeconds"
      },
      {
        "type": "string",
        "name": "nftName"
      },
      {
        "type": "string",
        "name": "nftSymbol"
      },
      {
        "type": "string",
        "name": "nftBaseURI"
      },
      {
        "type": "string",
        "name": "creatorRole"
      }
    ],
    "outputs": [
      {
        "type": "uint256",
        "name": "projectId"
      }
    ]
  },
  {
    "type": "function",
    "name": "deleteProject",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "projectId"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "finalizeProject",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "projectId"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "fundProject",
    "constant": false,
    "stateMutability": "payable",
    "payable": true,
    "inputs": [
      {
        "type": "uint256",
        "name": "projectId"
      },
      {
        "type": "bool",
        "name": "isAnonymous"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "getCofounders",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "projectId"
      }
    ],
    "outputs": [
      {
        "type": "address[]",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "getContribution",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "projectId"
      },
      {
        "type": "address",
        "name": "backer"
      }
    ],
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "getContributors",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "projectId"
      }
    ],
    "outputs": [
      {
        "type": "address[]",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "getProject",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "projectId"
      }
    ],
    "outputs": [
      {
        "type": "tuple",
        "name": "",
        "components": [
          {
            "type": "uint256",
            "name": "id"
          },
          {
            "type": "address",
            "name": "creator"
          },
          {
            "type": "string",
            "name": "title"
          },
          {
            "type": "string",
            "name": "description"
          },
          {
            "type": "string",
            "name": "imageUrl"
          },
          {
            "type": "string",
            "name": "category"
          },
          {
            "type": "uint256",
            "name": "goal"
          },
          {
            "type": "uint256",
            "name": "deadline"
          },
          {
            "type": "uint256",
            "name": "fundsRaised"
          },
          {
            "type": "bool",
            "name": "claimed"
          },
          {
            "type": "address[]",
            "name": "cofounders"
          },
          {
            "type": "address",
            "name": "nftContract"
          }
        ]
      }
    ]
  },
  {
    "type": "function",
    "name": "getProjectNFT",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "projectId"
      }
    ],
    "outputs": [
      {
        "type": "address",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "getTeamMemberRole",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "projectId"
      },
      {
        "type": "address",
        "name": "member"
      }
    ],
    "outputs": [
      {
        "type": "string",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "getTeamMembers",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "projectId"
      }
    ],
    "outputs": [
      {
        "type": "tuple[]",
        "name": "",
        "components": [
          {
            "type": "address",
            "name": "member"
          },
          {
            "type": "string",
            "name": "role"
          }
        ]
      }
    ]
  },
  {
    "type": "function",
    "name": "hasInspired",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "projectId"
      },
      {
        "type": "address",
        "name": "inspirer"
      }
    ],
    "outputs": [
      {
        "type": "bool",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "inspireProject",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "projectId"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "isCofounder",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "projectId"
      },
      {
        "type": "address",
        "name": "account"
      }
    ],
    "outputs": [
      {
        "type": "bool",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "isContributionAnonymous",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "projectId"
      },
      {
        "type": "address",
        "name": "backer"
      }
    ],
    "outputs": [
      {
        "type": "bool",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "processRefunds",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "projectId"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "projectCount",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "reputation",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "address",
        "name": ""
      }
    ]
  }
] as const,
  },
  userProfile: {
    address: "0x4d2265B27Fcc858a75B6142ACf58C38158eC71Ef" as `0x${string}`,
    abi: [
  {
    "type": "event",
    "anonymous": false,
    "name": "ProfileUpdated",
    "inputs": [
      {
        "type": "address",
        "name": "user",
        "indexed": true
      },
      {
        "type": "string",
        "name": "name",
        "indexed": false
      },
      {
        "type": "string",
        "name": "description",
        "indexed": false
      },
      {
        "type": "string",
        "name": "avatarUrl",
        "indexed": false
      }
    ]
  },
  {
    "type": "function",
    "name": "getProfile",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "_user"
      }
    ],
    "outputs": [
      {
        "type": "string",
        "name": "name"
      },
      {
        "type": "string",
        "name": "description"
      },
      {
        "type": "string",
        "name": "avatarUrl"
      },
      {
        "type": "bool",
        "name": "exists"
      }
    ]
  },
  {
    "type": "function",
    "name": "hasProfile",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "_user"
      }
    ],
    "outputs": [
      {
        "type": "bool",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "profiles",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": ""
      }
    ],
    "outputs": [
      {
        "type": "string",
        "name": "name"
      },
      {
        "type": "string",
        "name": "description"
      },
      {
        "type": "string",
        "name": "avatarUrl"
      },
      {
        "type": "bool",
        "name": "exists"
      }
    ]
  },
  {
    "type": "function",
    "name": "setProfile",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "string",
        "name": "_name"
      },
      {
        "type": "string",
        "name": "_description"
      },
      {
        "type": "string",
        "name": "_avatarUrl"
      }
    ],
    "outputs": []
  }
] as const,
  },
  eventManager: {
    address: "0xb613cF18d14BcB4dA20BB4003C1dB15B66Ba445E" as `0x${string}`,
    abi: [
  {
    "type": "constructor",
    "stateMutability": "undefined",
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "initialAdmin"
      },
      {
        "type": "address",
        "name": "_reputation"
      }
    ]
  },
  {
    "type": "error",
    "name": "AccessControlBadConfirmation",
    "inputs": []
  },
  {
    "type": "error",
    "name": "AccessControlUnauthorizedAccount",
    "inputs": [
      {
        "type": "address",
        "name": "account"
      },
      {
        "type": "bytes32",
        "name": "neededRole"
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "EventApproved",
    "inputs": [
      {
        "type": "uint256",
        "name": "eventId",
        "indexed": true
      },
      {
        "type": "address",
        "name": "admin",
        "indexed": true
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "EventRejected",
    "inputs": [
      {
        "type": "uint256",
        "name": "eventId",
        "indexed": true
      },
      {
        "type": "address",
        "name": "admin",
        "indexed": true
      },
      {
        "type": "string",
        "name": "reason",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "EventSubmitted",
    "inputs": [
      {
        "type": "uint256",
        "name": "eventId",
        "indexed": true
      },
      {
        "type": "address",
        "name": "creator",
        "indexed": true
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "MedalAwarded",
    "inputs": [
      {
        "type": "uint256",
        "name": "eventId",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "medalId",
        "indexed": true
      },
      {
        "type": "address",
        "name": "recipient",
        "indexed": true
      },
      {
        "type": "address",
        "name": "by",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "MedalClaimed",
    "inputs": [
      {
        "type": "uint256",
        "name": "eventId",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "medalId",
        "indexed": true
      },
      {
        "type": "address",
        "name": "claimer",
        "indexed": true
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "MedalCreated",
    "inputs": [
      {
        "type": "uint256",
        "name": "eventId",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "medalId",
        "indexed": true
      },
      {
        "type": "string",
        "name": "name",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "RoleAdminChanged",
    "inputs": [
      {
        "type": "bytes32",
        "name": "role",
        "indexed": true
      },
      {
        "type": "bytes32",
        "name": "previousAdminRole",
        "indexed": true
      },
      {
        "type": "bytes32",
        "name": "newAdminRole",
        "indexed": true
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "RoleGranted",
    "inputs": [
      {
        "type": "bytes32",
        "name": "role",
        "indexed": true
      },
      {
        "type": "address",
        "name": "account",
        "indexed": true
      },
      {
        "type": "address",
        "name": "sender",
        "indexed": true
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "RoleRevoked",
    "inputs": [
      {
        "type": "bytes32",
        "name": "role",
        "indexed": true
      },
      {
        "type": "address",
        "name": "account",
        "indexed": true
      },
      {
        "type": "address",
        "name": "sender",
        "indexed": true
      }
    ]
  },
  {
    "type": "function",
    "name": "ADMIN_ROLE",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "bytes32",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "DEFAULT_ADMIN_ROLE",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "bytes32",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "approveEvent",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "eventId"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "awardMedal",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "medalId"
      },
      {
        "type": "address",
        "name": "to"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "claimMedal",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "medalId"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "eventCount",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "getEvent",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "eventId"
      }
    ],
    "outputs": [
      {
        "type": "tuple",
        "name": "",
        "components": [
          {
            "type": "uint256",
            "name": "id"
          },
          {
            "type": "address",
            "name": "creator"
          },
          {
            "type": "string",
            "name": "title"
          },
          {
            "type": "string",
            "name": "description"
          },
          {
            "type": "string",
            "name": "location"
          },
          {
            "type": "string",
            "name": "imageUrl"
          },
          {
            "type": "uint64",
            "name": "datetime"
          },
          {
            "type": "string",
            "name": "timeText"
          },
          {
            "type": "uint8",
            "name": "status"
          },
          {
            "type": "string",
            "name": "rejectReason"
          }
        ]
      }
    ]
  },
  {
    "type": "function",
    "name": "getEventMedals",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "eventId"
      }
    ],
    "outputs": [
      {
        "type": "tuple[]",
        "name": "",
        "components": [
          {
            "type": "uint256",
            "name": "id"
          },
          {
            "type": "uint256",
            "name": "eventId"
          },
          {
            "type": "string",
            "name": "name"
          },
          {
            "type": "string",
            "name": "description"
          },
          {
            "type": "string",
            "name": "iconUrl"
          },
          {
            "type": "uint32",
            "name": "points"
          },
          {
            "type": "uint32",
            "name": "maxClaims"
          },
          {
            "type": "uint32",
            "name": "claimsCount"
          },
          {
            "type": "bool",
            "name": "active"
          }
        ]
      }
    ]
  },
  {
    "type": "function",
    "name": "getMedal",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "medalId"
      }
    ],
    "outputs": [
      {
        "type": "tuple",
        "name": "",
        "components": [
          {
            "type": "uint256",
            "name": "id"
          },
          {
            "type": "uint256",
            "name": "eventId"
          },
          {
            "type": "string",
            "name": "name"
          },
          {
            "type": "string",
            "name": "description"
          },
          {
            "type": "string",
            "name": "iconUrl"
          },
          {
            "type": "uint32",
            "name": "points"
          },
          {
            "type": "uint32",
            "name": "maxClaims"
          },
          {
            "type": "uint32",
            "name": "claimsCount"
          },
          {
            "type": "bool",
            "name": "active"
          }
        ]
      }
    ]
  },
  {
    "type": "function",
    "name": "getRoleAdmin",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "bytes32",
        "name": "role"
      }
    ],
    "outputs": [
      {
        "type": "bytes32",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "grantAdmin",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "account"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "grantRole",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "bytes32",
        "name": "role"
      },
      {
        "type": "address",
        "name": "account"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "hasClaimed",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": ""
      },
      {
        "type": "address",
        "name": ""
      }
    ],
    "outputs": [
      {
        "type": "bool",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "hasRole",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "bytes32",
        "name": "role"
      },
      {
        "type": "address",
        "name": "account"
      }
    ],
    "outputs": [
      {
        "type": "bool",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "medalCount",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "rejectEvent",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "eventId"
      },
      {
        "type": "string",
        "name": "reason"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "renounceRole",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "bytes32",
        "name": "role"
      },
      {
        "type": "address",
        "name": "callerConfirmation"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "reputation",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "address",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "revokeAdmin",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "account"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "revokeRole",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "bytes32",
        "name": "role"
      },
      {
        "type": "address",
        "name": "account"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "setMedalActive",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "medalId"
      },
      {
        "type": "bool",
        "name": "active"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "setReputationContract",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "_reputation"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "submitEvent",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "string",
        "name": "title"
      },
      {
        "type": "string",
        "name": "description"
      },
      {
        "type": "string",
        "name": "location"
      },
      {
        "type": "string",
        "name": "imageUrl"
      },
      {
        "type": "uint64",
        "name": "datetime"
      },
      {
        "type": "string",
        "name": "timeText"
      },
      {
        "type": "string[]",
        "name": "medalNames"
      },
      {
        "type": "string[]",
        "name": "medalDescriptions"
      },
      {
        "type": "string[]",
        "name": "medalIcons"
      },
      {
        "type": "uint32[]",
        "name": "medalPoints"
      },
      {
        "type": "uint32[]",
        "name": "medalMaxClaims"
      }
    ],
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "supportsInterface",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "bytes4",
        "name": "interfaceId"
      }
    ],
    "outputs": [
      {
        "type": "bool",
        "name": ""
      }
    ]
  }
] as const,
  },
} as const;

export type ProjectNFTABI = typeof CONTRACTS.projectNFT.abi;
export type ReputationABI = typeof CONTRACTS.reputation.abi;
export type LaunchpadABI = typeof CONTRACTS.launchpad.abi;
export type UserProfileABI = typeof CONTRACTS.userProfile.abi;
export type EventManagerABI = typeof CONTRACTS.eventManager.abi;
