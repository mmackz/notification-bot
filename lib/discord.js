const { Client, Events, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

const client = new Client({
   intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
   ]
});

client.once(Events.ClientReady, async (c) => {
   console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
   if (message.author.bot) return;

   const commandChannelId = process.env.COMMAND_CHANNEL_ID;

   if (
      message.channel.id === commandChannelId &&
      message.content === "!enable-notifications"
   ) {
      try {
         // Replace roleName with the name of the role you want to assign (setup up in discord options first!)
         const roleName = "quester";
         const role = message.guild.roles.cache.find((r) => r.name === roleName);

         if (!role) {
            console.error(`Role "${roleName}" not found in the server.`);
            return;
         }

         await message.member.roles.add(role);
         await message.channel.send(
            "You have been granted the role to receive notifications!"
         );
      } catch (error) {
         console.error("An error occurred while granting the role:", error);
         await message.channel.send(
            "An error occurred while granting the role. Please contact an administrator."
         );
      }
   }
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
