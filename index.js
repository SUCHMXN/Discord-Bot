require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { TOKEN, CLIENT_ID, GUILD_ID } = process.env; 

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers, 
  ],
});

let messages = [];
let logChannelId = null; 

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const commands = [
    new SlashCommandBuilder()
      .setName('addmsg')
      .setDescription('Add a message to the spam list')
      .addStringOption(option =>
        option.setName('message')
          .setDescription('The message to add')
          .setRequired(true)),
    new SlashCommandBuilder()
      .setName('sendto')
      .setDescription('Send all messages to a specific user via DM')
      .addUserOption(option =>
        option.setName('user')
          .setDescription('The user to send to')
          .setRequired(true))
      .addIntegerOption(option =>
        option.setName('times')
          .setDescription('Number of times to repeat (default 1)')
          .setRequired(false)),
    new SlashCommandBuilder()
      .setName('sendall')
      .setDescription('Send all messages to all members in the guild via DM')
      .addIntegerOption(option =>
        option.setName('times')
          .setDescription('Number of times to repeat (default 1)')
          .setRequired(false))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder()
      .setName('setlogchannel')
      .setDescription('Set the channel where logs will be sent')
      .addChannelOption(option =>
        option.setName('channel')
          .setDescription('The channel to send logs to')
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  ].map(command => command.toJSON());

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
});

async function sendLog(message) {
  if (logChannelId) {
    const logChannel = client.channels.cache.get(logChannelId);
    if (logChannel) {
      try {
        await logChannel.send(message);
      } catch (error) {
        console.error(`Failed to send log: ${error}`);
      }
    }
  }
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'addmsg') {
    const message = interaction.options.getString('message');
    messages.push(message);
    await interaction.reply({ content: `Added message: "${message}"\nCurrent messages: ${messages.join(', ')}`, ephemeral: true });
    await sendLog(`Added message: "${message}" by ${interaction.user.tag}`);
  } else if (commandName === 'sendto') {
    if (messages.length === 0) {
      await interaction.reply({ content: 'No messages added yet.', ephemeral: true });
      return;
    }
    const user = interaction.options.getUser('user');
    const times = interaction.options.getInteger('times') || 1;

    await sendLog(`Starting send to ${user.tag} (${times} times) by ${interaction.user.tag}`);

    try {
      for (let i = 0; i < times; i++) {
        for (const msg of messages) {
          await user.send(msg);
        }
      }
      await interaction.reply({ content: `Sent all messages ${times} time(s) to ${user.username}.`, ephemeral: true });
      await sendLog(`Successfully sent to ${user.tag}`);
    } catch (error) {
      if (error.code === 50007) { // Cannot send messages to this user
        await interaction.reply({ content: `Cannot send DM to ${user.username}. They might have DMs disabled or blocked the bot.`, ephemeral: true });
        await sendLog(`Failed to send to ${user.tag}: Cannot send DM`);
      } else {
        await interaction.reply({ content: `An error occurred: ${error.message}`, ephemeral: true });
        await sendLog(`Failed to send to ${user.tag}: ${error.message}`);
      }
    }
  } else if (commandName === 'sendall') {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      await interaction.reply({ content: 'You need administrator permissions to use this command.', ephemeral: true });
      return;
    }
    if (messages.length === 0) {
      await interaction.reply({ content: 'No messages added yet.', ephemeral: true });
      return;
    }
    const times = interaction.options.getInteger('times') || 1;
    const guild = interaction.guild;

    await sendLog(`Starting sendall (${times} times) in guild ${guild.name} by ${interaction.user.tag}`);

    let successful = [];
    let failed = [];
    let progressCounter = 0;

    const members = await guild.members.fetch();
    const totalMembers = Array.from(members.values()).filter(m => !m.user.bot).length;

    for (const member of members.values()) {
      if (member.user.bot) continue;
      try {
        for (let i = 0; i < times; i++) {
          for (const msg of messages) {
            await member.send(msg);
          }
        }
        successful.push(member.user.tag);
        await sendLog(`Sent to ${member.user.tag}`);
      } catch (error) {
        failed.push(member.user.tag);
        await sendLog(`Failed to send to ${member.user.tag}: ${error.message}`);
      }

      progressCounter++;
      if (progressCounter % 10 === 0) {
        await sendLog(`Progress: Processed ${progressCounter}/${totalMembers} members`);
      }
    }

    await interaction.reply({ content: `Sent messages to ${successful.length} members. Failed for ${failed.length} members.`, ephemeral: true });
    await sendLog(`Sendall complete: Success ${successful.length}, Failed ${failed.length}\nSuccessful: ${successful.join(', ')}\nFailed: ${failed.join(', ')}`);
  } else if (commandName === 'setlogchannel') {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      await interaction.reply({ content: 'You need administrator permissions to use this command.', ephemeral: true });
      return;
    }
    const channel = interaction.options.getChannel('channel');
    logChannelId = channel.id;
    await interaction.reply({ content: `Log channel set to #${channel.name} (ID: ${channel.id}).`, ephemeral: true });
    await sendLog(`Log channel set to this channel by ${interaction.user.tag}`);
  }
});

client.login(TOKEN);
