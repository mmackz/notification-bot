const { Client, Events, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async (c) => {
   console.log(`Ready! Logged in as ${c.user.tag}`);
});

async function sendMessage(message) {
   // sends a message to the provided discord channel
/* To find channel id, set discord to developer mode
   , then right-click the channel in your test server */
   try {
      const channel = await client.channels.fetch(process.env.CHANNEL_ID);
      await channel.send(message);
   } catch (error) {
      console.error("An error occurred while fetching the channel:", error);
   }
}

client.login(process.env.DISCORD_TOKEN);

module.exports = {
   sendMessage
};