const { Events } = require("discord.js");
require("dotenv").config();
const subscribeEvents = require("./lib/events");
const discord = require("./lib/discord");

const { client } = discord;

// log in and start listening for QuestCreated Events
client.once(Events.ClientReady, async (c) => {
   console.log(`Ready! Logged in as ${c.user.tag}`);
   subscribeEvents(discord.sendMessage);
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

client.login(process.env.DISCORD_TOKEN);
