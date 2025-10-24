export const userProfileABI = [
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
] as const;