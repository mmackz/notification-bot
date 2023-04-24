

   ## notification-bot

### About the project

A discord bot to notify members when a new rabbithole quest becomes available. 

### What It Does

When the bot is installed in a server, it will create a "**🔔 | Notifications**" Category, and two channels. One for setup ("**🔔-setup**"), and one to post the notifications ("**🔔-notifications**"). Members can add/remove the **@Quester** role by clicking the button in the "**🔔-setup**" channel. This role will allow the member to be notified when a new quest appears.

### Instructions
  - Manually create a new server named "QuestBot". This is the home server needed for reading/writing custom emojis.
  - Create a bot user in the discord developer portal and retrieve the discord token.
  - After cloning/forking the project, setup the .env file in the root of the app.
  - The .env file must include your discord token in this format ```DISCORD_TOKEN=token```
  - You will need an alchemy key in your .env file to be able to subscribe to contract events. ```ALCHEMY_KEY=key```
  - The bot will require the following permissions:
    - Manage Roles
    - Manage Channels
    - Read Messages/View Channels
    - Send Messages
    - Read Message History
    - Use External Emojis
  - Set the correct permissions in the discord developer portal and invite to your server.
    1. Go to the developer portal and find the *OAuth2* tab.
    2. Go to *General*, scroll down to *Default Authorization Link* and select *In-app Authorization*
    3. Tick the *bot* checkbox under scope.
    4. Fill in the bot permissions as listed above and save.
    5. Go to URL Generator and select *bot* under scope.
    6. Fill in the bot permissions as listed above.
    7. Copy/Paste the URL in your browser to invite the bot to a new server.
  - Lastly, you will need to manually set the *Manage Expressions* permission in the server settings (under *role*) for your bots role in the home *QuestBot* server created on the first step. 
  
  To install dependencies:
  
```bash
npm install
```
  
  To run the development server:

```bash
npm run dev
```

  To run the start server:

```bash
npm start
```
