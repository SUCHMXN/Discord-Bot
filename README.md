# Discord Spam Bot
DM Bot for discord keep in mind if caught abusing your account may be reported, limited or banned

## Setup

1. Install dependencies: `npm install`
2. Fill in your values inside of `.env` not inside of `.env.example`
3. Deploy commands: `npm run deploy`
4. Start the bot: `npm run start`

## Notes
- Use responsibly.
- Spamming can lead to bans.



# Discord Spam Bot README

## Overview
This is a simple Discord bot built with Node.js and discord.js that allows you to add messages to a list and send them (spam) to specific users or all members in a server via direct messages (DMs). It includes slash commands for ease of use and a logging system to track progress and results in a specified Discord channel.

**Warning**: Spamming or mass DMing violates Discord's Terms of Service (TOS) and can result in your bot, account, or server being banned. This bot is for educational purposes only. Use it responsibly in private servers with explicit consent from all participants. The developer is not responsible for any misuse.

## Features
- Add messages to a spam list (`/addmsg`).
- Send messages to a specific user (`/sendto`).
- Send messages to all non-bot members in the server (`/sendall` - admin only).
- Set a log channel for progress updates, successes, failures, and summaries (`/setlogchannel` - admin only).
- Logs include start/end of operations, per-user status (for `/sendall`), progress every 10 members, and final summaries.


## Setup Instructions

### 1. Create a Discord Bot
   - Go to the [Discord Developer Portal](https://discord.com/developers/applications).
   - Click "New Application", name it, and create.
   - Go to the "Bot" tab and click "Add Bot".
   - Under "Privileged Gateway Intents", enable:
     - **Server Members Intent** (to fetch guild members).
   - Copy the **Bot Token** (from the Bot tab—reset if needed).
   - Copy the **Application ID** (from the General Information tab—this is your CLIENT_ID).
   - (Optional) Copy a **Guild ID** (server ID) for testing: Right-click your server in Discord > Copy Server ID (enable Developer Mode in Discord settings if needed).

### 2. Invite the Bot to Your Server
   - In the Developer Portal, go to OAuth2 > URL Generator.
   - Select scopes: `bot` and `applications.commands`.
   - Select permissions: `Administrator` (for simplicity; or at minimum: Send Messages, View Channels).
   - Copy the generated URL, paste it in your browser, and invite the bot to your server.


### 3. Install Dependencies
   - Download/extract the project files (index.js, register-commands.js, .env.example, package.json).
   - Open a terminal in the project folder.
   - Run: `npm install` (this installs discord.js and dotenv based on package.json).


### 4. Configure Environment Variables
   - Open `.env` in a text editor and fill in the values (no quotes, no extra spaces):


### 5. Run the Bot
- Run: `node index.js`
- Success: "Logged in as [bot name]!" in the console.
- The bot is now online. In Discord, type `/` in a text channel to see available commands.

## How to Use the Bot
Once the bot is running and invited to your server:

1. **Set Up Logging (Recommended First Step)**:
- Use `/setlogchannel channel:#your-log-channel` (admin only).
- Replace `#your-log-channel` with a text channel where logs should go (bot needs Send Messages permission there).
- Logs will track all actions, progress, and results.

2. **Add Messages**:
- Command: `/addmsg message:Your message here`
- Adds the text to the message list. You can add multiple.
- Example: `/addmsg message:Hello world!`
- Logs: Records the addition.

3. **Send to a Specific User**:
- Command: `/sendto user:@username times:3` (times optional, default 1).
- Sends all added messages to the user via DM, repeated `times` times.
- Example: `/sendto user:@friend times:2`
- Logs: Start, success/failure for that user.

4. **Send to All Members**:
- Command: `/sendall times:3` (times optional, default 1; admin only).
- Sends all messages to every non-bot member in the server via DM, repeated `times` times.
- Progress logs every 10 members; final summary lists successful/failed users.
- Use cautiously—large servers or high `times` can hit rate limits or cause bans.

5. **View Commands**:
- In Discord, type `/` to list them. Responses are ephemeral (visible only to you).
