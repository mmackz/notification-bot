const { Events } = require("discord.js");
const subscribeEvents = require("./lib/events");
const subscribeMirrorPosts = require("./lib/mirror");
const discord = require("./lib/discord");
require("dotenv").config();

const { client } = discord;

// log in and start listening for QuestCreated Events
client.once(Events.ClientReady, async (c) => {
   console.log(`Ready! Logged in as ${c.user.tag}`);

   // subscribe to QuestCreated Events
   subscribeEvents(discord.sendNotification);

   // subscribe to Mirror Rabbithole Mirror Posts
   subscribeMirrorPosts(discord.notifyMirrorPost);
});

// setup channels/roles when installed to new server
client.on(Events.GuildCreate, async (guild) => {
   await discord.setupGuild(guild);
});

// assign/remove Quester role when button is clicked
client.on("interactionCreate", async (interaction) => {
   if (interaction.isButton() && interaction.customId === "set-role") {
      await discord.toggleRole(interaction);
   }
});

// Use process.env.DISCORD_TOKEN for production
client.login(process.env.DISCORD_TOKEN_DEV);
