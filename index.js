const { Events } = require("discord.js");
require("dotenv").config();
const subscribeEvents = require("./lib/events");
const discord = require("./lib/discord");

const { client } = discord;

client.once(Events.ClientReady, async (c) => {
   // log in and start listening for QuestCreated Events
   console.log(`Ready! Logged in as ${c.user.tag}`);
   subscribeEvents(discord.sendMessage);
});

client.on(Events.GuildCreate, async (guild) => {
   await discord.setupGuild(guild);
});

client.on("interactionCreate", async (interaction) => {
   if (interaction.isButton() && interaction.customId === "set-role") {
      await discord.toggleRole(interaction);
   }
});

client.login(process.env.DISCORD_TOKEN);
