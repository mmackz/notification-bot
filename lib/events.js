const contracts = require("./utils/contracts");

module.exports = async (sendMessage) => {

   for (const chain of Object.keys(contracts)) {
      console.log(`Subscribing to QuestCreated Events on ${chain}`);
      const contract = contracts[chain];
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
   }
};
