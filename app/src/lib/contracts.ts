/**
 * Contract addresses and ABIs for Base Sepolia deployment
 * Auto-generated from /deployments/base-sepolia.json
 * Last updated: 2025-10-21T11:02:12.304Z
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
          { "name": "backer", "type": "address" },
          { "name": "investmentAmount", "type": "uint256" }
        ],
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "getInvestmentAmount",
        "inputs": [{ "name": "tokenId", "type": "uint256" }],
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "totalSupply",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "baseURI",
        "inputs": [],
        "outputs": [{ "name": "", "type": "string" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "tokensOfOwner",
        "inputs": [{ "name": "owner", "type": "address" }],
        "outputs": [{ "name": "", "type": "uint256[]" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "ownerOf",
        "inputs": [{ "name": "tokenId", "type": "uint256" }],
        "outputs": [{ "name": "", "type": "address" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "tokenURI",
        "inputs": [{ "name": "tokenId", "type": "uint256" }],
        "outputs": [{ "name": "", "type": "string" }],
        "stateMutability": "view"
      },
      {
        "type": "event",
        "name": "NFTMinted",
        "inputs": [
          { "name": "backer", "type": "address", "indexed": true },
          { "name": "tokenId", "type": "uint256", "indexed": true },
          { "name": "investmentAmount", "type": "uint256", "indexed": false }
        ]
      }
    ] as const,
  },
  reputation: {
    address: "0x2b9DB0b23866dc574698E031Dfb103f85a50A43e" as `0x${string}`,
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
    address: "0x83BCaB75414Dd64e995d0b4Fd80CF3077e8C995A" as `0x${string}`,
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
        "name": "durationInDays"
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
    address: "0x4B4c91f34b55DC652B1c6Ad65Bd34E106E89AC82" as `0x${string}`,
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
} as const;

export type ProjectNFTABI = typeof CONTRACTS.projectNFT.abi;
export type ReputationABI = typeof CONTRACTS.reputation.abi;
export type LaunchpadABI = typeof CONTRACTS.launchpad.abi;
export type UserProfileABI = typeof CONTRACTS.userProfile.abi;
