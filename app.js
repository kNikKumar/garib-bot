const fs = require("node:fs");
const {Client, GatewayIntentBits, SlashCommandBuilder, Events, ModalBuilder, ActionRowBuilder, 
	TextInputBuilder, TextInputStyle, Collection} = require('discord.js');
const path = require("node:path");
const { token, guildId } = require("./config.json");
const cron = require('node-cron');
const { appendFileSync } = require('fs');
const { getAuthToken, getSpreadSheet, getSpreadSheetValues} = require("./spreadSheet/spreadSheet");


const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	console.log(command.data.name);
	client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, client => {
	console.log("Ready!");

	// # ┌────────────── second (optional)
	// # │ ┌──────────── minute
	// # │ │ ┌────────── hour
	// # │ │ │ ┌──────── day of month
	// # │ │ │ │ ┌────── month
	// # │ │ │ │ │ ┌──── day of week
	// # │ │ │ │ │ │
	// # │ │ │ │ │ │ 
	// # * * * * * *
	cron.schedule('* * * * *', () => {
		client.channels.cache.get(guildId).send("Hello!")
		console.log('running a task every minute');
	}, {
		scheduled: true,
		timezone: "Asia/Kolkata"
	})
})

client.on("messageCreate", (message) => {
    if (message.author.bot) return false; 
    
    console.log(`Message from ${message.author.username}: ${message.content}`);
    message.channel.send(`${message.content}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	if (interaction.commandName === 'ping') {
		const modal = new ModalBuilder().setCustomId("pingModal").setTitle("My Modal");

		const fields = {
			favColorInput: new TextInputBuilder()
				.setCustomId("favColorInput")
				.setLabel("Whatis your fav color")
				.setStyle(TextInputStyle.Short),

			hobbiesInput: new TextInputBuilder()
				.setCustomId("hobbiesInput")
				.setLabel("What is your Hobby")
				.setStyle(TextInputStyle.Short)
		}

		const firstActionRow = new ActionRowBuilder().addComponents(fields.favColorInput);

		const secondActionRow = new ActionRowBuilder().addComponents(fields.hobbiesInput);

		modal.addComponents(firstActionRow, secondActionRow);

		await interaction.showModal(modal);
	}
})

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isModalSubmit()) return;

	if (interaction.customId === "pingModal") {
		const favColor = interaction.fields.getTextInputValue("favColorInput");
		const hobbies = interaction.fields.getTextInputValue("hobbiesInput");

		const auth = await getAuthToken();
		const response = await getSpreadSheet({
			spreadsheetId:"1WOZwOke7daJUyaFpwUFe_colgtFMBRKDwZPdEurXllA", auth
		})

		const sheetResponse = await getSpreadSheetValues({
			spreadsheetId: "1WOZwOke7daJUyaFpwUFe_colgtFMBRKDwZPdEurXllA", 
			auth,
			sheetName: "Sheet1"
		})

		console.log(sheetResponse.data.values);

		await interaction.reply({content: `You color ${favColor}, hobbies ${hobbies}`})

		const userSubmittedData = `${favColor}, ${hobbies}\n`;
		try {
			appendFileSync("./contacts.csv", userSubmittedData);
		} catch (err) {
			console.log(err);
		}
	}
})

client.login(token);
  