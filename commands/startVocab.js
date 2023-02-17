const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("startvocab")
        .setDescription("Starts Vocab BOT!")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    async executes(interaction) {
        await interaction.reply("Brewing the dingle berries!");
    }
}