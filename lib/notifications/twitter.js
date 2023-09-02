const { TwitterApi } = require("twitter-api-v2");
const logger = require("../../utils/logging");
require("dotenv").config();

const client = new TwitterApi({
   appKey: process.env.TWITTER_API_KEY,
   appSecret: process.env.TWITTER_API_SECRET,
   accessToken: process.env.TWITTER_ACCESS_TOKEN,
   accessSecret: process.env.TWITTER_ACCESS_SECRET
});

const twitterClient = client.readWrite;

async function sendTweet(data) {
   const shortUrl = await shortenUrl(createUrl(data.questId));
   const message = createMessage(shortUrl, data);

   // Send tweet to twitter client
   await twitterClient.v2.tweet(message);
}

function createMessage(url, data) {
   return `🎩 New Quest Alert on RabbitHole! 
   
🛠️ Deployed By: ${data.questCreator}
   
📈 Score: +${data.rewardData[0].score} Points
   
🌐 Check it out here: ${url}
      `;
}

function createUrl(questId) {
   return `https://rabbithole.gg/quests/${questId}?wallet_ref=${process.env.REF_ADDRESS}`;
}

async function shortenUrl(url) {
   const urlShorteners = [shortenUrlBitly, shortenUrlRebrandly];

   // try to shorten the url using one of the available URL shorteners
   for (const shortener of urlShorteners) {
      try {
         const shortUrl = await shortener(url);
         return shortUrl;
      } catch (error) {
         logger.error(`Failed to shorten URL with ${shortener.name}:`, error);
         continue;
      }
   }

   // If no shortener is available, return original url
   logger.error(`Failed to shorten URL, returning original url: ${url}`);
   return url;
}

async function shortenUrlRebrandly(url) {
   const response = await fetch("https://api.rebrandly.com/v1/links", {
      method: "POST",
      headers: {
         apikey: process.env.REBRANDLY_API_KEY,
         "Content-Type": "application/json"
      },
      body: JSON.stringify({
         destination: url
      })
   });

   if (!response.ok) {
      throw new Error("Rebrandly API call failed");
   }

   const data = await response.json();
   return data.shortUrl;
}

async function shortenUrlBitly(url) {
   const response = await fetch("https://api-ssl.bitly.com/v4/shorten", {
      method: "POST",
      headers: {
         Authorization: `Bearer ${process.env.BITLY_API_KEY}`,
         "Content-Type": "application/json"
      },
      body: JSON.stringify({
         long_url: url,
         domain: "bit.ly"
      })
   });

   if (!response.ok) {
      throw new Error("Bitly API call failed");
   }

   const data = await response.json();
   return data.link;
}

module.exports = {
   sendTweet
};
