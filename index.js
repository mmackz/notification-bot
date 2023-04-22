const {
   Client,
   EmbedBuilder,
   Events,
   GatewayIntentBits,
   ActionRowBuilder,
   ButtonBuilder,
   ButtonStyle
} = require("discord.js");
require("dotenv").config();
const subscribeEvents = require("./lib/events");
const convertSvg = require("./lib/convertSvg");
const json = require("./lib/json");
const svgToPng = require("./lib/convertSvg");

const client = new Client({
   intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
   ]
});

// Name for notification role
const roleName = "Quester";

client.once(Events.ClientReady, async (c) => {
   // log in and start listening for QuestCreated Events
   console.log(`Ready! Logged in as ${c.user.tag}`);
   subscribeEvents(sendMessage);
});

client.on(Events.GuildCreate, async () => {
   // Create Notification setup message when bot is installed
   const embed = new EmbedBuilder()
      .setColor(0x9000a2)
      .setTitle("Quest Notifications")
      .setDescription("Click the bell emoji below to turn on/off quest notifications.");

   const channel = await client.channels.fetch(process.env.SETUP_CHANNEL_ID);

   try {
      // check if channel is empty before creating message
      const messages = await channel.messages.fetch({ limit: 1 });
      const isEmpty = messages.size === 0;

      if (isEmpty) {
         await channel.send({
            embeds: [embed],
            components: [
               new ActionRowBuilder().setComponents(
                  new ButtonBuilder()
                     .setCustomId("notifications")
                     .setLabel("Press Here 🔔")
                     .setStyle(ButtonStyle.Primary)
               )
            ]
         });
      }
   } catch (error) {
      console.error("Error setting up the server:", error);
   }
});

client.on("interactionCreate", async (interaction) => {
   if (interaction.isButton() && interaction.customId === "notifications") {
      const { guild, member } = interaction;
      const role = guild.roles.cache.find((r) => r.name === roleName);
      const hasRole = member.roles.cache.has(role.id);
      if (hasRole) {
         await member.roles.remove(role);
         interaction.reply({
            content: `We have removed the <@&${process.env.ROLE_ID}> role. You will no longer receive quest notifications. Press the button again if you want to re-enable notifications.`,
            ephemeral: true
         });
      } else {
         await member.roles.add(role);
         interaction.reply({
            content: `You have been assigned the <@&${process.env.ROLE_ID}> role. This will allow you to receive quest notifications in the <#${process.env.NOTIFICATION_CHANNEL_ID}> channel. Press the button again if you would like to turn off notifications.`,
            ephemeral: true
         });
      }
   }
});

async function createEmbed(data) {
   const { questId, name, description, rewards } = data;
   let icon = data.icon;

   // convert .svg icons to png
   if (icon.includes(".svg")) {
      icon = `attachment://thumbnail.png`;
   }

   // check if reward icon exists in json file
   const emojis = json.read();

   if (!Object.keys(emojis).includes(rewards.token)) {
      // create new emoji and save id to json file
      const emojiGuild = client.guilds.cache.get(process.env.EMOJI_GUILD_ID);
      const createdEmoji = await emojiGuild.emojis.create({
         attachment: !rewards.icon.endsWith(".svg")
            ? rewards.icon
            : await svgToPng(rewards.icon),
         name: rewards.token
      });
      json.write({ [rewards.token]: createdEmoji.id, ...emojis });
      rewardIcon = `<:${rewards.token}:${createdEmoji.id}>`;
   } else {
      rewardIcon = `<:${rewards.token}:${emojis[rewards.token]}>`;
   }

   return new EmbedBuilder()
      .setColor(0x9000a2)
      .setTitle("A New Quest Has Started")
      .setURL(`https://rabbithole.gg/quests?quest=${questId}`)
      .setAuthor({
         name: "Rabbithole",
         iconURL: "https://i.imgur.com/WxFBgaR.png",
         url: "https://rabbithole.gg"
      })
      .setThumbnail(icon)
      .addFields(
         { name: "Quest Name", value: name, inline: true },
         {
            name: "Reward",
            value: `${rewards.amount} ${rewardIcon}`,
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
      const { iconOption: icon, name, description, rewards: rewardData } = questData;

      const rewards = {
         token: rewardData[0].tokenSymbol,
         amount: rewardData[0].amount / 10 ** 18,
         icon: rewardData[0].s3Link
      };

      const embed = await createEmbed({ questId, icon, name, description, rewards });
      const channel = await client.channels.fetch(process.env.NOTIFICATION_CHANNEL_ID);
      const files = [];

      if (icon.endsWith(".svg")) {
         const png = await convertSvg(icon);
         if (png) {
            files.push({ attachment: png, name: "thumbnail.png" });
         }
      }

      const roleMention = "**TEST, NOT REAL!!**" || `<@&${process.env.ROLE_ID}>`;
      await channel.send({
         content: `A New Quest Has Appeared! ${roleMention}`,
         embeds: [embed],
         files
      });
   } catch (e) {
      console.error(e);
   }
}

client.login(process.env.DISCORD_TOKEN);
