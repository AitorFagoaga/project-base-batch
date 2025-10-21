import { env } from "./env";

export const EVENT_MANAGER = {
  address: env.EVENT_MANAGER_ADDRESS,
  abi: [
    { type: "constructor", inputs: [{ name: "initialAdmin", type: "address" }], stateMutability: "nonpayable" },
    // AccessControl bits used for gating
    { type: "function", name: "ADMIN_ROLE", inputs: [], outputs: [{ type: "bytes32" }], stateMutability: "view" },
    { type: "function", name: "hasRole", inputs: [{ type: "bytes32", name: "role" }, { type: "address", name: "account" }], outputs: [{ type: "bool" }], stateMutability: "view" },
    // Counters
    { type: "function", name: "eventCount", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
    { type: "function", name: "medalCount", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
    // Submissions/approvals
    {
      type: "function",
      name: "submitEvent",
      inputs: [
        { type: "string", name: "title" },
        { type: "string", name: "description" },
        { type: "string", name: "location" },
        { type: "uint64", name: "datetime" },
        { type: "string", name: "timeText" },
        { type: "string[]", name: "medalNames" },
        { type: "string[]", name: "medalDescriptions" },
        { type: "string[]", name: "medalIcons" },
        { type: "uint32[]", name: "medalPoints" },
        { type: "uint32[]", name: "medalMaxClaims" },
      ],
      outputs: [{ type: "uint256" }],
      stateMutability: "nonpayable",
    },
    { type: "function", name: "approveEvent", inputs: [{ type: "uint256", name: "eventId" }], outputs: [], stateMutability: "nonpayable" },
    { type: "function", name: "rejectEvent", inputs: [{ type: "uint256", name: "eventId" }, { type: "string", name: "reason" }], outputs: [], stateMutability: "nonpayable" },
    // Medal controls
    { type: "function", name: "setMedalActive", inputs: [{ type: "uint256", name: "medalId" }, { type: "bool", name: "active" }], outputs: [], stateMutability: "nonpayable" },
    { type: "function", name: "awardMedal", inputs: [{ type: "uint256", name: "medalId" }, { type: "address", name: "to" }], outputs: [], stateMutability: "nonpayable" },
    { type: "function", name: "claimMedal", inputs: [{ type: "uint256", name: "medalId" }], outputs: [], stateMutability: "nonpayable" },
    // Views
    {
      type: "function",
      name: "getEvent",
      inputs: [{ type: "uint256", name: "eventId" }],
      outputs: [
        {
          type: "tuple",
          components: [
            { type: "uint256", name: "id" },
            { type: "address", name: "creator" },
            { type: "string", name: "title" },
            { type: "string", name: "description" },
            { type: "string", name: "location" },
            { type: "uint64", name: "datetime" },
            { type: "string", name: "timeText" },
            { type: "uint8", name: "status" },
            { type: "string", name: "rejectReason" },
          ],
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getEventMedals",
      inputs: [{ type: "uint256", name: "eventId" }],
      outputs: [
        {
          type: "tuple[]",
          components: [
            { type: "uint256", name: "id" },
            { type: "uint256", name: "eventId" },
            { type: "string", name: "name" },
            { type: "string", name: "description" },
            { type: "string", name: "iconUrl" },
            { type: "uint32", name: "points" },
            { type: "uint32", name: "maxClaims" },
            { type: "uint32", name: "claimsCount" },
            { type: "bool", name: "active" },
          ],
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getMedal",
      inputs: [{ type: "uint256", name: "medalId" }],
      outputs: [
        {
          type: "tuple",
          components: [
            { type: "uint256", name: "id" },
            { type: "uint256", name: "eventId" },
            { type: "string", name: "name" },
            { type: "string", name: "description" },
            { type: "string", name: "iconUrl" },
            { type: "uint32", name: "points" },
            { type: "uint32", name: "maxClaims" },
            { type: "uint32", name: "claimsCount" },
            { type: "bool", name: "active" },
          ],
        },
      ],
      stateMutability: "view",
    },
    { type: "function", name: "hasClaimed", inputs: [{ type: "uint256", name: "medalId" }, { type: "address", name: "user" }], outputs: [{ type: "bool" }], stateMutability: "view" },
  ] as const,
};

export type EventManagerABI = typeof EVENT_MANAGER.abi;
