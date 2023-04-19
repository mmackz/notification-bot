const chains = require("./utils/chains");

const subscribe = async function (contract, web3, sendMessage) {
   let lastBlock = await web3.eth.getBlockNumber();

   setInterval(async () => {
      try {
         const fromBlock = lastBlock + 1;
         const toBlock = await web3.eth.getBlockNumber();
         console.log(fromBlock, toBlock);
         const events = await contract.getPastEvents("QuestCreated", {
            fromBlock,
            toBlock
         });

         for (const event of events) {
            const { questId, startTime } = event.returnValues;
            const delay = startTime * 1000 - Date.now();
            console.log(`New Quest Created: ${questId}`);
            setTimeout(async () => {
               await sendMessage(questId);
            }, delay);
         }

         // Update the last block number
         lastBlock = toBlock;
      } catch (error) {
         console.error("Error fetching events:", error);
      }
   }, 300_000);
};

module.exports = async (sendMessage) => {
   for (const chain of Object.keys(chains)) {
      const { contract, web3 } = chains[chain];
      subscribe(contract, web3, sendMessage);
   }
};
