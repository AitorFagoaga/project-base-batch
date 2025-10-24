export const launchpadABI = [
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
] as const;