

   ## notification-bot

### About the project

A discord bot to notify rabbithole members when a new quest becomes available.

### Instructions
  - After cloning/forking the project, you will need to setup the .env file in the root of the app.
  - The .env file must include your discord token in this format ```DISCORD_TOKEN=token```
  - You will also need an alchemy key in your .env file to be able to subscribe to contract events. ```ALCHEMY_KEY=key```
  - At the moment, the bot only needs the permission to send messages in a channel.
  - Create a test sever and invite the bot to it. Create the channel you would like to give it access to, and find the channel id. You can turn on developer mode in discord, then right click the channel to find the id. Enter it into your .env file ```CHANNEL_ID=id```
  
  To install dependencies:
  
```bash
npm install
```
  
  To run the development server:

```bash
npm run dev
```
