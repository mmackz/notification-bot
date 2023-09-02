const discord = require("../lib/notifications/index");
const twitter = require("../lib/notifications/twitter");

module.exports = function() {
   return {
     subscribeEvents: async function() {
       const subscribeEvents = require("../lib/notifications/events");
       subscribeEvents(discord.sendNotification, twitter.sendTweet);
     },
     subscribeMirrorPosts: async function() {
       const subscribeMirrorPosts = require("../lib/notifications/mirror");
       subscribeMirrorPosts(discord.notifyMirrorPost);
     },
     setupGuild: async function(guild) {
       await discord.setupGuild(guild);
     },
     toggleRole: async function(interaction) {
       await discord.toggleRole(interaction);
     }
   }
 }