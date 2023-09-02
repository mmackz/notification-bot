const { Events } = require("discord.js");
const { client } = require("./lib/discord");
const logger = require("./utils/logging");

const NotificationService = require("./services/notification");
const NotificationController = require("./controllers/notification");

const notificationService = NotificationService();
const notificationController = NotificationController(notificationService);

require("./api");

client.once(Events.ClientReady, async (c) => {
   logger.info(`Ready! Logged in as ${c.user.tag}`);
   notificationController.handleClientReady();
});

client.on(Events.GuildCreate, async (guild) => {
   notificationController.handleGuildCreate(guild);
});

client.on("interactionCreate", async (interaction) => {
   notificationController.handleInteractionCreate(interaction);
});

client.login(process.env.DISCORD_TOKEN_DEV);
