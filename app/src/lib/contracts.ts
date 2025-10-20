/**
 * Contract addresses and ABIs for Base Sepolia deployment
 * Auto-generated from /deployments/base-sepolia.json
 * Last updated: 2025-10-20T23:14:55.592Z
 * Owner: 0x31a42406422E72dC790cF42eD978458B0b00bd06
 */

export const CONTRACTS = {
  reputation: {
    address: "0x6A9F0A968BF23df10AB954E788a1A99718388816" as `0x${string}`,
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
    address: "0x95469D42822E8C323e6FC4c7f2cF46EC26249195" as `0x${string}`,
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
        "type": "uint256",
        "name": "goal"
      },
      {
        "type": "uint256",
        "name": "durationInDays"
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
    "name": "fundProject",
    "constant": false,
    "stateMutability": "payable",
    "payable": true,
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
          }
        ]
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
} as const;

export type ReputationABI = typeof CONTRACTS.reputation.abi;
export type LaunchpadABI = typeof CONTRACTS.launchpad.abi;
