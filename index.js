require("dotenv").config();
const Web3 = require("web3");
const contractAbi = require("./lib/utils/abi");

const discord = require("./lib/discord");

const ethWeb3 = new Web3(
   new Web3.providers.WebsocketProvider(
      `wss://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
   )
);

const polygonWeb3 = new Web3(
   new Web3.providers.WebsocketProvider(
      `wss://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
   )
);

const optimismWeb3 = new Web3(
   new Web3.providers.WebsocketProvider(
      `wss://opt-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
   )
);

// Address for Quest Factory contract
const contractAddress = "0x52629961f71c1c2564c5aa22372cb1b9fa9eba3e";
const contract = new optimismWeb3.eth.Contract(contractAbi, contractAddress);

contract.events.QuestCreated(
   {
      fromBlock: "latest"
   },
   async (error, event) => {
      if (error) {
         console.error("Error:", error);
      } else {
         const {
            questId,
            rewardTokenAddress,
            startTime,
            endTime,
            totalParticipants,
            rewardAmountOrTokenId
         } = event.returnValues;
         const message = "New quest started: " + JSON.stringify(questId);

         // Send the message to the Discord channel
         await discord.sendMessage(message);
      }
   }
);
