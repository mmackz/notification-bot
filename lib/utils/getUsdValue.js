const logger = require("./logging");
const { getCache, setCache } = require("./cache");

function isEmpty(arr) {
   return Array.isArray(arr) && arr.length === 0;
}

async function getCoinValue(coinId) {
   let data = getCache(coinId);

   // return cached data if it exists
   if (data) {
      logger.info("getting cache");
      return data;
   }
   try {
      // if cache does not exist, fetch data and set cache
      const response = await fetch(
         `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
      );
      data = await response.json();
      setCache(coinId, data);
      return data;
   } catch (error) {
      logger.info("error getting coin value");
      return null;
   }
}

// global variable to hold cached coin ids
let coinGeckoIds = [];

async function setCoinGeckoIds() {
   try {
      const res = await fetch("https://api.coingecko.com/api/v3/coins/list");
      const resData = await res.json();
      if (Array.isArray(resData)) {
         coinGeckoIds = resData;
      }
   } catch (e) {
      logger.info("There was an error fetching coingecko ids");
   }
}

async function getUsdValue(coindata) {
   if (!isEmpty(coinGeckoIds)) {
      const coin = {
         symbol: coindata.rewards[0].tokenSymbol,
         id: coinGeckoIds.find(
            (x) => x.symbol.toLowerCase() === coindata.rewards[0].tokenSymbol.toLowerCase()
         )?.id
      };

      if (coin.symbol === "rETH") {
         coin.id = "rocket-pool-eth";
      }
      if (coin.symbol === "USDC") {
         coin.id = "usd-coin";
      }

      try {
         let value;
         if (coindata.rewards[0].type === "erc1155") {
            value = "NFT";
         } else {
            const response = await getCoinValue(coin.id);
            value = response[coin.id]?.usd;
         }
         return value || 0;
      } catch (error) {
         logger.info("There was an error fetching price data");
         return 0;
      }
   } else {
      await setCoinGeckoIds();
      return 0;
   }
}

module.exports = {
   getUsdValue,
   setCoinGeckoIds
};
