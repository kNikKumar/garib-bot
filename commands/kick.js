const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Select a member to kick"),
    async executes(interaction) {
        await interaction.reply("Kicked!");
    }
}