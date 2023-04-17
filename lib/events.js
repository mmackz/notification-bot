require("dotenv").config();
const Web3 = require("web3");
const contractAbi = require("./utils/abi");

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

const questEvent = {
   questId: "7c8fde2d-4c57-4504-9447-2b91990eacff",
   startTime: "1681599600"
};

// For testing purposes
/* module.exports = async (discord) => {
   console.log("Testing event");
   const { questId, startTime } = questEvent;
   await discord.sendMessage({ questId, startTime });
}; */


module.exports = async (sendMessage) => {
   console.log("Subscribing to QuestCreated Events on Optimism");
   contract.events.QuestCreated(
      {
         fromBlock: "latest"
      },
      async (error, event) => {
         if (error) {
            console.error("Error:", error);
         } else {
            const { questId, startTime } = event.returnValues;
            const delay = startTime * 1000 - Date.now();
            console.log(`New Quest Created: ${questId}`);
            setTimeout(async () => {
               await sendMessage(questId);
            }, delay);    
         }
      }
   );
};
