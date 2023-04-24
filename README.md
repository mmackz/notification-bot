

   ## notification-bot

### About the project

A discord bot to notify rabbithole members when a new quest becomes available.

### Instructions
  - After cloning/forking the project, you will need to setup the .env file in the root of the app.
  - Manually create a new server named "QuestBot". This is the home server needed for reading/writing custom emojis.
  - Create a bot user in the dicord developer portal and retrieve the discord token.
  - The .env file must include your discord token in this format ```DISCORD_TOKEN=token```
  - You will need an alchemy key in your .env file to be able to subscribe to contract events. ```ALCHEMY_KEY=key```
  - The bot will require the following permissions
    - Manage Roles
    - Manage Channels
    - Read Messages/View Channels
    - Send Messages
    - Read Message History
    - Use External Emojis
  - Set the correct permissions in the discord developer portal.
    1. Go to the developer portal and find the *OAuth2* tab.
    2. Go to *General*, scroll down to *Default Authorization Link* and select *In-app Authorization*
    3. Tick the *bot* checkbox under scope
    4. Fill in the bot permissions as listed above and save.
    5. Go to URL Generator and select *bot* under scope
    6. Fill in the bot permissions as listed above
    7. Copy/Paste the URL in your browser to invite the bot to a new server
  
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
