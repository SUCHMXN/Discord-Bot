const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;

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
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
