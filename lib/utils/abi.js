const questAbi = [
   {
      inputs: [],
      name: "queued",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function"
   }
];

const questFactoryAbi = [
   {
      anonymous: false,
      inputs: [
         { indexed: true, internalType: "address", name: "creator", type: "address" },
         {
            indexed: true,
            internalType: "address",
            name: "contractAddress",
            type: "address"
         },
         { indexed: false, internalType: "string", name: "questId", type: "string" },
         { indexed: false, internalType: "string", name: "contractType", type: "string" },
         {
            indexed: false,
            internalType: "address",
            name: "rewardTokenAddress",
            type: "address"
         },
         { indexed: false, internalType: "uint256", name: "endTime", type: "uint256" },
         { indexed: false, internalType: "uint256", name: "startTime", type: "uint256" },
         {
            indexed: false,
            internalType: "uint256",
            name: "totalParticipants",
            type: "uint256"
         },
         {
            indexed: false,
            internalType: "uint256",
            name: "rewardAmountOrTokenId",
            type: "uint256"
         }
      ],
      name: "QuestCreated",
      type: "event"
   },
   {
      anonymous: false,
      inputs: [
         { indexed: true, internalType: "address", name: "recipient", type: "address" },
         { indexed: true, internalType: "address", name: "questAddress", type: "address" },
         { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
         { indexed: false, internalType: "string", name: "questId", type: "string" }
      ],
      name: "ReceiptMinted",
      type: "event"
   }
];

module.exports = {
   questAbi,
   questFactoryAbi
};
