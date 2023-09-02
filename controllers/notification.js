module.exports = function(notificationService) {
   return {
     handleClientReady: async function() {
       await notificationService.subscribeEvents();
       await notificationService.subscribeMirrorPosts();
     },
     handleGuildCreate: async function(guild) {
       await notificationService.setupGuild(guild);
     },
     handleInteractionCreate: async function(interaction) {
       if (interaction.isButton() && interaction.customId === "set-role") {
         await notificationService.toggleRole(interaction);
       }
     }
   }
 }