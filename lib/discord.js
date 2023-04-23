const {
   Client,
   EmbedBuilder,
   GatewayIntentBits,
   PermissionsBitField,
   ActionRowBuilder,
   ButtonBuilder,
   ButtonStyle,
   ChannelType,
   Colors
} = require("discord.js");
const convertSvg = require("./convertSvg");
const json = require("./json");
const svgToPng = require("./convertSvg");
require("dotenv").config();

const client = new Client({
   intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
   ]
});

async function createRole(guild) {
   const rolename = "Quester";
   const role = guild.roles.cache.find((r) => r.name === rolename);
   if (!role) {
      console.log("Creating quester role..");
      return guild.roles.create({
         name: rolename,
         color: Colors.Gold,
         Permissions: 0
      });
   }
   return role;
}

async function setupRoleMessage(channel) {
   // Create Notification setup message for role creation
   const embed = new EmbedBuilder()
      .setColor(0x9000a2)
      .setTitle("Quest Notifications")
      .setDescription("Click the bell emoji below to turn on/off quest notifications.");

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
                     .setCustomId("set-role")
                     .setLabel("Press Here 🔔")
                     .setStyle(ButtonStyle.Primary)
               )
            ]
         });
      }
   } catch (error) {
      console.error("Error setting up the server:", error);
   }
}

async function createChannels(guild, role) {
   // Check in Notification category exists, if not, create it.
   const categoryName = "Notifications";
   const questbot = guild.roles.cache.find((r) => r.name === "QuestBot");
   const channels = [];

   const categoryChannel = guild.channels.cache.find(
      (c) => c.type === ChannelType.GuildCategory && c.name === categoryName
   );

   let categoryId;

   if (!categoryChannel) {
      const category = await guild.channels.create({
         name: categoryName,
         type: ChannelType.GuildCategory
      });
      categoryId = category.id;
   } else {
      categoryId = categoryChannel.id;
   }

   // Check in Setup channel exists, if not, create it.
   const setupChannel = guild.channels.cache.find(
      (c) => c.parentId === categoryId && c.name === "🔔-setup"
   );

   // ONLY WORKS AS ADMIN!!! FIX ASAP!!!
   if (!setupChannel) {
      const channel = await guild.channels.create({
         name: "🔔-setup",
         parent: guild.channels.cache.find(
            (c) => c.type === ChannelType.GuildCategory && c.name === categoryName
         ),
         type: ChannelType.GuildText,
         permissionOverwrites: [
            {
               id: guild.id,
               allow: [],
               deny: [
                  PermissionsBitField.Flags.AddReactions,
                  PermissionsBitField.Flags.SendMessages
               ]
            },
            {
               id: role.id,
               allow: [],
               deny: []
            },
            {
               id: questbot.id,
               allow: [PermissionsBitField.Flags.SendMessages],
               deny: []
            }
         ]
      });
      setupRoleMessage(channel);
      channels.push(channel);
   } else {
      channels.push(setupChannel);
   }

   // Check in Notification channel exists, if not, create it.
   const notificationsChannel = guild.channels.cache.find(
      (c) => c.parentId === categoryId && c.name === "🔔-notifications"
   );

   if (!notificationsChannel) {
      channels.push(
         await guild.channels.create({
            name: "🔔-notifications",
            parent: guild.channels.cache.find(
               (c) => c.type === ChannelType.GuildCategory && c.name === categoryName
            ),
            type: ChannelType.GuildText,
            permissionOverwrites: [
               {
                  id: questbot.id,
                  allow: [
                     PermissionsBitField.Flags.ViewChannel,
                     PermissionsBitField.Flags.SendMessages,
                     PermissionsBitField.Flags.EmbedLinks,
                     PermissionsBitField.Flags.AttachFiles
                  ],
                  deny: []
               },
               {
                  id: role.id,
                  allow: [
                     PermissionsBitField.Flags.AddReactions,
                     PermissionsBitField.Flags.ViewChannel,
                     PermissionsBitField.Flags.ReadMessageHistory
                  ],
                  deny: [PermissionsBitField.Flags.SendMessages]
               },
               {
                  id: guild.id,
                  allow: [],
                  deny: [PermissionsBitField.Flags.ViewChannel]
               }
            ]
         })
      );
   } else {
      channels.push(notificationsChannel);
   }
   return channels;
}

async function setupGuild(guild) {
   const role = await createRole(guild);
   await createChannels(guild, role);
}

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

      const files = [];

      if (icon.endsWith(".svg")) {
         const png = await convertSvg(icon);
         if (png) {
            files.push({ attachment: png, name: "thumbnail.png" });
         }
      }

      client.guilds.cache.forEach(async (guild) => {
         const role = guild.roles.cache.find((r) => r.name === "Quester");
         const roleMention = "**TEST, NOT REAL!!**" || `<@&${role.id}>`;
         const channel = guild.channels.cache.find(
            (c) => c.name === "🔔-notifications" && c.parent?.name === "Notifications"
         );

         if (channel) {
            await channel.send({
               content: `A New Quest Has Appeared! ${roleMention}`,
               embeds: [embed],
               files
            });
         }
      });
   } catch (e) {
      console.error(e);
   }
}

async function toggleRole(interaction) {
   const { guild, member } = interaction;
   const notifyChannel = guild.channels.cache.find(
      (c) => c.name === "🔔-notifications" && c.parent?.name === "Notifications"
   );
   const role = guild.roles.cache.find((r) => r.name === "Quester");
   const hasRole = member.roles.cache.has(role.id);
   if (hasRole) {
      await member.roles.remove(role);
      interaction.reply({
         content: `We have removed the <@&${role.id}> role. You will no longer receive quest notifications. Press the button again if you want to re-enable notifications.`,
         ephemeral: true
      });
   } else {
      await member.roles.add(role);
      interaction.reply({
         content: `You have been assigned the <@&${role.id}> role. This will allow you to receive quest notifications in the <#${notifyChannel.id}> channel. Press the button again if you would like to turn off notifications.`,
         ephemeral: true
      });
   }
}

module.exports = {
   client,
   setupGuild,
   sendMessage,
   toggleRole
};
