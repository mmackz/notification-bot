const chains = require("./utils/chains");
const { questAbi } = require("./utils/abi");

async function checkQueued(web3, contract) {
   try {
      const questContract = new web3.eth.Contract(questAbi, contract);
      return await questContract.methods.queued().call();
   } catch (error) {
      console.error("There was an error checking the quest contract", error);
   }
}

async function fetchData(questId) {
   // quest endpoints for rabbithole require a valid address
   const address = "0x0000000000000000000000000000000000000000";

   try {
      const response = await fetch(
         `https://api.rabbithole.gg/v1.1/quest/${address}/${questId}`
      );
      const questData = await response.json();
      return {
         description: questData.description,
         icon: questData.iconOption,
         name: questData.name,
         questAddress: questData.questAddress,
         questId: questData.id,
         rewardData: questData.rewards
      };
   } catch (error) {
      console.error("There was an error fetching the quest data", error);
      return null;
   }
}

const subscribe = async function (contract, web3, sendMessage) {
   let lastBlock = await web3.eth.getBlockNumber();

   setInterval(async () => {
      try {
         const fromBlock = lastBlock + 1;
         const toBlock = await web3.eth.getBlockNumber();
         const events = await contract.getPastEvents("QuestCreated", {
            fromBlock,
            toBlock
         });

         for (const event of events) {
            const { questId, startTime } = event.returnValues;
            const delay = startTime * 1000 - Date.now();
            console.log(`New Quest Created: ${questId}`);

            // fetch quest data from rabbithole api
            const questData = await fetchData(questId);

            if (questData) {
               setTimeout(async () => {
                  // check if quest has been queued before sending notification
                  if (checkQueued(web3, questData.questAddress)) {
                     await sendMessage(questData);
                  }
               }, Math.max(delay, 0));
            }
         }

         // Update the last block number
         lastBlock = toBlock;
      } catch (error) {
         console.error("Error fetching events:\n", error);
      }
   }, 300_000);
};

module.exports = async (sendMessage) => {
   for (const chain of Object.keys(chains)) {
      const { contract, web3 } = chains[chain];
      subscribe(contract, web3, sendMessage);
   }
};
