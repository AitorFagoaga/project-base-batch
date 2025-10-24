export const eventManagerABI = [
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
] as const;