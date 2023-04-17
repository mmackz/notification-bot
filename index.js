const { Client, EmbedBuilder, Events, GatewayIntentBits } = require("discord.js");
const subscribeEvents = require("./lib/events");
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
   subscribeEvents(sendMessage);
});

client.on(Events.MessageCreate, async (message) => {
   if (message.author.bot) return;

   const commandChannelId = process.env.COMMAND_CHANNEL_ID;

   if (
      message.channel.id === commandChannelId &&
      message.content === "!enable-notifications"
   ) {
      try {
         const roleName = "Quester";
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

function createEmbed(data) {
   const { questId, icon, name, description, rewards } = data;
   return new EmbedBuilder()
      .setColor(0x9000a2)
      .setTitle("A New Quest Has Started")
      .setURL(`https://rabbithole.gg/quests?quest=${questId}`)
      .setAuthor({
         name: "Rabbithole",
         iconURL: "https://cryptocurrencyjobs.co/startups/assets/logos/rabbithole.png",
         url: "https://rabbithole.gg"
      })
      .setDescription(`<@&${process.env.ROLE_ID}>`)
      .setThumbnail(icon)
      .addFields(
         { name: "Quest Name", value: name, inline: true },
         {
            name: "Reward",
            value: `${rewards.amount} <:OP:1097255896603697262>`,
            inline: true
         },
         { name: "Description", value: description, inline: false }
      );
}

async function sendMessage(questId) {
   // quest endpoints for rabbithole require a valid address
   const address = "0x0000000000000000000000000000000000000000";

   try {
      const response = await fetch(
         `https://api.rabbithole.gg/v1.1/quest/${address}/${questId}`
      );
      const questData = await response.json();
      const { iconOption: icon, name, description } = questData;
      const rewards = {
         token: questData.rewards[0].tokenSymbol,
         amount: questData.rewards[0].amount / 10 ** 18
      };
      const embed = createEmbed({ questId, icon, name, description, rewards });
      const channel = await client.channels.fetch(process.env.CHANNEL_ID);
      const roleMention = `<@&${process.env.ROLE_ID}>`;
      await channel.send({ content: `${roleMention}`, embeds: [embed] });
   } catch (e) {
      console.error(e);
   }
}

client.login(process.env.DISCORD_TOKEN);
