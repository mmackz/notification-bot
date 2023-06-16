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
const convertSvg = require("./utils/convertSvg");
const svgToPng = require("./utils/convertSvg");

const client = new Client({
   intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
   ]
});

async function createChannels(guild, role) {
   // Check in Notification category exists, if not, create it.
   const categoryName = "🔔 | Notifications";
   const questbot = guild.roles.cache.find((r) => r.name === "QuestBot");

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
      (c) => c.parentId === categoryId && c.name === "🔔-notification-setup"
   );

   if (!setupChannel) {
      const channel = await guild.channels.create({
         name: "🔔-notification-setup",
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
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.CreatePublicThreads
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
      console.log(`🔔-notification-setup channel has been created in ${guild.name}`);
   }

   // Check in Notification channel exists, if not, create it.
   const notificationsChannel = guild.channels.cache.find(
      (c) => c.parentId === categoryId && c.name === "🔔-notifications"
   );

   if (!notificationsChannel) {
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
               deny: [
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.CreatePublicThreads
               ]
            },
            {
               id: guild.id,
               allow: [],
               deny: [PermissionsBitField.Flags.ViewChannel]
            }
         ]
      });
      console.log(`🔔-notifications channel has been created in ${guild.name}`);
   }
}

async function createEmbed(data) {
   const { questId, name, description, rewards } = data;
   let icon = data.icon;

   // convert .svg icons to png
   if (icon.includes(".svg")) {
      icon = `attachment://thumbnail.png`;
   }

   const emoji = await getRewardEmoji(rewards);
   const rewardIcon = `<:${emoji.name}:${emoji.id}>`;

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
         { name: "Quest Name", value: name },
         {
            name: "Reward",
            value: `${rewards.amount} ${rewardIcon}`,
            inline: true
         },
         {
            name: "USD Value",
            value: rewards.usdValue,
            inline: true
         },
         { name: "Description", value: description, inline: false }
      );
}

async function createRole(guild) {
   const rolename = "Quester";
   const role = guild.roles.cache.find((r) => r.name === rolename);
   if (!role) {
      console.log(`Quester role created in ${guild.name}`);
      return guild.roles.create({
         name: rolename,
         color: Colors.Yellow,
         Permissions: 0
      });
   }
   return role;
}

async function getRewardEmoji(data) {
   const guild = client.guilds.cache.find((g) => g.name === "QuestBot");
   let emoji = guild.emojis.cache.find((e) => e.name === data.token);

   if (!emoji) {
      // If emoji is not found, create it
      emoji = await guild.emojis.create({
         attachment: !data.icon.endsWith(".svg") ? data.icon : await svgToPng(data.icon),
         name: data.token
      });
      console.log(`Emoji for ${data.token} was created.`);
   }
   return emoji;
}

async function sendNotification(questData) {
   const { description, icon, name, questId, rewardData, usdValue } = questData;
   const rewards = {
      token: rewardData[0].tokenSymbol,
      amount: rewardData[0].amount / 10 ** rewardData[0].decimals,
      icon: rewardData[0].s3Link,
      usdValue
   };

   try {
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
         const roleMention = role ? `<@&${role.id}>` : "";
         const channel = guild.channels.cache.find((c) => c.name === "🔔-notifications");

         if (channel) {
            try {
               await channel.send({
                  content: `A New Quest Has Appeared! ${roleMention}`,
                  embeds: [embed],
                  files
               });
            } catch (error) {
               console.error(
                  `There was an issue sending the notification in ${guild.name}\n`,
                  error
               );
            }
         }
      });
   } catch (error) {
      console.error(`An error while trying to post a new notification\n`, error);
   }
}

async function setupGuild(guild) {
   try {
      const role = await createRole(guild);
      await createChannels(guild, role);
   } catch (error) {
      console.error(`An error occurred while setting up the bot in ${guild.name}\n`, error);
   }
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
      console.error("There was an error creating the role setup message:\n", error);
   }
}

async function toggleRole(interaction) {
   try {
      const { guild, member } = interaction;

      const notifyChannel = guild.channels.cache.find((c) => c.name === "🔔-notifications");
      const role = guild.roles.cache.find((r) => r.name === "Quester");

      // Send error message if channel or role is missing
      if (!notifyChannel || !role) {
         return interaction.reply({
            content: "Error: Unable to find the required channel or role.",
            ephemeral: true
         });
      }

      // Send error message if QuestBot role is lower in heirarchy than the Quester role
      const questbot = await guild.members.fetch(client.user.id);
      if (role.position > questbot.roles.botRole.position) {
         return interaction
            .reply({
               content:
                  "Error: QuestBot does not have permission to change roles. Please contact the server administrator.",
               ephemeral: true
            })
            .catch((e) =>
               console.log("An error occured while replying to the interaction")
            );
      }

      const hasRole = member.roles.cache.has(role.id);
      if (hasRole) {
         await member.roles.remove(role);
         interaction
            .reply({
               content: `We have removed the <@&${role.id}> role. You will no longer receive quest notifications. Press the button again if you want to re-enable notifications.`,
               ephemeral: true
            })
            .catch((e) =>
               console.log("An error occured while replying to the interaction")
            );
      } else {
         await member.roles.add(role);
         interaction
            .reply({
               content: `You have been assigned the <@&${role.id}> role. This will allow you to receive quest notifications in the <#${notifyChannel.id}> channel. Press the button again if you would like to turn off notifications.`,
               ephemeral: true
            })
            .catch((e) =>
               console.log("An error occured while replying to the interaction")
            );
      }
   } catch (error) {
      console.error("An error occurred in the toggleRole function:\n", error);
      interaction.reply({
         content:
            "An error occurred. Please try again later or contact a server administrator.",
         ephemeral: true
      });
   }
}

async function notifyMirrorPost({ digest, title }) {
   console.log(`New mirror post: ${title}`);

   client.guilds.cache.forEach(async (guild) => {
      const channel = guild.channels.cache.find((c) => c.name === "🪞-rabbithole-mirror");
      if (channel) {
         try {
            await channel.send(`https://rabbithole.mirror.xyz/${digest}`);
         } catch (error) {
            console.error(
               `There was an issue sending a mirror post notification in ${guild.name}\n`,
               error
            );
         }
      }
   });
}

module.exports = {
   client,
   notifyMirrorPost,
   sendNotification,
   setupGuild,
   toggleRole
};
