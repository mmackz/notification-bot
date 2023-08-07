const chains = require("./utils/chains");
const { getUsdValue, setCoinGeckoIds } = require("./utils/getUsdValue");
const client = require("./utils/viem");

async function fetchData(questId) {
   // quest endpoints for rabbithole require a valid address
   const address = "0x0000000000000000000000000000000000000000";

   try {
      const response = await fetch(
         `https://api.rabbithole.gg/v1.2/quest/${address}/${questId}`
      );
      const questData = await response.json();

      // check for allowlist or not quequed
      if (questData.allowlistEnabled || !questData.queued) return null;

      // calculate usd value for quest
      const usdValue = await getUsdValue(questData);
      const amount = questData.rewards[0].amount / 10 ** questData.rewards[0].decimals;

      if (typeof usdValue !== "string") {
         // skip quests with low USD value or low participant number
         if (usdValue * amount < 0.1 || questData.totalParticipants < 10) return null;
      }

      const questCreatorEns = await client.getEnsName({
         address: questData.creatorAddress
      });

      const usdValueString =
         typeof usdValue === "string"
            ? usdValue
            : `~$${(usdValue * amount).toFixed(2)} USD`;

      return {
         description: questData.description,
         icon: questData.iconOption,
         name: questData.name,
         questAddress: questData.questAddress,
         questCreator: questCreatorEns ?? questData.creatorAddress,
         questId: questData.id,
         rewardData: questData.rewards,
         usdValue: usdValueString
      };
   } catch (error) {
      console.error("There was an error fetching the quest data", error);
      return null;
   }
}

const subscribe = async function (contract, web3, sendMessage, sendTweet) {
   let lastBlock = await web3.eth.getBlockNumber();

   setInterval(async () => {
      try {
         const fromBlock = lastBlock + 1;
         const toBlock = await web3.eth.getBlockNumber();
         if (fromBlock < toBlock) {
            const events = await contract.getPastEvents("QuestCreated", {
               fromBlock,
               toBlock
            });

            for (let i = 0; i < events.length; i++) {
               const event = events[i];
               const { questId, startTime } = event.returnValues;
               const delay = startTime * 1000 - Date.now();
               console.log(`New Quest Created: ${questId}`);
               const interval = i * 375; // delay between quest events to allow time for api values to cache

               setTimeout(async () => {
                  // fetch quest data from rabbithole api
                  const questData = await fetchData(questId);
                  if (questData) {
                     await sendMessage(questData);
                     await sendTweet(`https://rabbithole.gg/quests?quest=${questId}`);
                  }
               }, Math.max(delay, 60_000) + interval);
            }

            // Update the last block number
            lastBlock = toBlock;
         }
      } catch (error) {
         console.error("Error fetching events:\n", error);
      }
   }, 300_000);
};

module.exports = async (sendMessage, sendTweet) => {
   await setCoinGeckoIds();
   for (const chain of Object.keys(chains)) {
      const { contract, web3 } = chains[chain];
      subscribe(contract, web3, sendMessage, sendTweet);
   }
};
