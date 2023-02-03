const {Client, GatewayIntentBits, SlashCommandBuilder} = require('discord.js');
require('dotenv').config();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

client.on("messageCreate", (message) => {
    if (message.author.bot) return false; 
    
    console.log(`Message from ${message.author.username}: ${message.content}`);
    message.channel.send(`${message.content}`);
});

client.login(process.env.BOT_TOKEN);
  
client.on('ready', () => console.log('The Bot is ready!'));
  