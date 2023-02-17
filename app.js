const fs = require("node:fs");
const {Client, GatewayIntentBits, SlashCommandBuilder, Events, ModalBuilder, ActionRowBuilder, 
	TextInputBuilder, TextInputStyle, Collection, EmbedBuilder, ButtonBuilder, ButtonStyle, InteractionType} = require('discord.js');
const path = require("node:path");
const { token, guildIdVocab, vocabChannelID } = require("./config.json");
const cron = require('node-cron');
const { appendFileSync } = require('fs');
const { getAuthToken, getSpreadSheetValues, postSpreadSheetValues} = require("./spreadSheet/spreadSheet");
const wait = require('node:timers/promises').setTimeout;
const moment = require("moment");
let vocabWord = null;

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

// client.once(Events.ClientReady, client => {
// 	console.log("Ready!");

// 	// # ┌────────────── second (optional)
// 	// # │ ┌──────────── minute
// 	// # │ │ ┌────────── hour
// 	// # │ │ │ ┌──────── day of month
// 	// # │ │ │ │ ┌────── month
// 	// # │ │ │ │ │ ┌──── day of week
// 	// # │ │ │ │ │ │
// 	// # │ │ │ │ │ │ 
// 	// # * * * * * *
// 	cron.schedule('30 10 * * *', () => {
// 		client.channels.cache.get(guildIdVocab).send("Hello!")
// 		console.log('running a task every minute');
// 	}, {
// 		scheduled: true,
// 		timezone: "Asia/Kolkata"
// 	})
// })

async function vocabFunction(interaction, vocabChannelID) {
	console.log(interaction.channelId, vocabChannelID);
	const auth = await getAuthToken();

	const dataBaseVocab = await getSpreadSheetValues({
		spreadsheetId: "1BjNo6L1QxYD0CGftM3fT696K77TGGeGin5o3mhwLLeQ",
		auth, sheetName: "Shooting!A:E"
	});
	
	
	const word = dataBaseVocab.data.values[1][0];
	const meaning = dataBaseVocab.data.values[1][1];
	const example = dataBaseVocab.data.values[1][2];
	const date = dataBaseVocab.data.values[1][3];

	vocabWord = word;

	const vocabTryButton = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('vocabTryButton')
				.setLabel('Try')
				.setStyle(ButtonStyle.Primary)
		)

	const vocabEmbed = new EmbedBuilder()
		.setColor(0x4700cb)
		.setTitle(`Your daily dose of Vocab! 🔔 ` + date)
		.setDescription([
			`__Word__: ${word}`,
			``,
			`__Meaning__: ${meaning}`,
			``,
			`__Example__: ${example}`,
		].join('\n'))
		.setFooter({
			text: "Submit your own example and earn 2 Spokken coins.",
			iconURL: "https://spokkencommunity.autocode.dev/dailyvocabspocab@dev/image/down2.png"
		});

	interaction.channel.send({
		ephemeral: true, 
		embeds: [vocabEmbed], 
		components: [vocabTryButton]
	});
}

client.once(Events.ClientReady, client => {
	console.log("Ready!");
})

// client.on("messageCreate", (message) => {
//     if (message.author.bot) return false; 
    
//     console.log(`Message from ${message.author.username}: ${message.content}`);
//     message.channel.send(`${message.content}`);
// });

// client.on(Events.InteractionCreate, async interaction => {
// 	if (!interaction.isChatInputCommand()) return;

// 	if (interaction.commandName === 'ping') {
// 		const modal = new ModalBuilder().setCustomId("pingModal").setTitle("My Modal");

// 		const fields = {
// 			favColorInput: new TextInputBuilder()
// 				.setCustomId("favColorInput")
// 				.setLabel("Whatis your fav color")
// 				.setStyle(TextInputStyle.Short),

// 			hobbiesInput: new TextInputBuilder()
// 				.setCustomId("hobbiesInput")
// 				.setLabel("What is your Hobby")
// 				.setStyle(TextInputStyle.Short)
// 		}

// 		const firstActionRow = new ActionRowBuilder().addComponents(fields.favColorInput);

// 		const secondActionRow = new ActionRowBuilder().addComponents(fields.hobbiesInput);

// 		modal.addComponents(firstActionRow, secondActionRow);

// 		await interaction.showModal(modal);
// 	}
// })

// client.on(Events.InteractionCreate, async interaction => {
// 	if (!interaction.isModalSubmit()) return;

// 	if (interaction.customId === "pingModal") {
// 		const favColor = interaction.fields.getTextInputValue("favColorInput");
// 		const hobbies = interaction.fields.getTextInputValue("hobbiesInput");

// 		const auth = await getAuthToken();
// 		const response = await getSpreadSheet({
// 			spreadsheetId:"1WOZwOke7daJUyaFpwUFe_colgtFMBRKDwZPdEurXllA", auth
// 		})

// 		const sheetResponse = await getSpreadSheetValues({
// 			spreadsheetId: "1WOZwOke7daJUyaFpwUFe_colgtFMBRKDwZPdEurXllA", 
// 			auth,
// 			sheetName: "Sheet1"
// 		})

// 		console.log(sheetResponse.data.values);

// 		await interaction.reply({content: `You color ${favColor}, hobbies ${hobbies}`})

// 		const userSubmittedData = `${favColor}, ${hobbies}\n`;
// 		try {
// 			appendFileSync("./contacts.csv", userSubmittedData);
// 		} catch (err) {
// 			console.log(err);
// 		}
// 	}
// })

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	if (interaction.commandName === 'startvocab') {
		if (interaction.channelId == vocabChannelID) {
			cron.schedule('*/3 * * * *', () => {
				vocabFunction(interaction, vocabChannelID);
				console.log("scheduler Vocab");
			}, {
				scheduled: true,
				timezone: "Asia/Kolkata"
			})
		}
	}
})

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isButton) return;

	if (interaction.customId === "vocabTryButton") {
		const vacabModal = new ModalBuilder()
			.setCustomId("vacabModal")
			.setTitle("Think and forget. Practice and remember. 👇")
			.addComponents([
				new ActionRowBuilder().addComponents(
					new TextInputBuilder()
						.setCustomId("vocabExample")
						.setLabel("Leave an example below!")
						.setPlaceholder("Example")
						.setMinLength(1)
						.setMaxLength(4000)
						.setRequired(true)
						.setStyle(TextInputStyle.Paragraph)
				)
			]);

		await interaction.showModal(vacabModal);
	}

	if (interaction.type === InteractionType.ModalSubmit) {

		if (interaction.customId === "vacabModal") {
			const response = interaction.fields.getTextInputValue("vocabExample");
			console.log(response);

			await interaction.deferUpdate();
			await wait(4000);
			const auth = await getAuthToken();

			const data = [
				`${interaction.user.tag}`, 
				`${interaction.user.id}`, 
				response, 
				`${moment().format("YYYY-MM-DD HH:mm:ss")}`,
				`${interaction.message.id}`
			]

			console.log(data);

			// const dataBaseVocab = await postSpreadSheetValues({
			// 	spreadsheetId: "1BjNo6L1QxYD0CGftM3fT696K77TGGeGin5o3mhwLLeQ",
			// 	auth, 
			// 	sheetName: "Try!A:G",
			// 	data: [
			// 		`${interaction.user.tag}`, 
			// 		`${interaction.user.id}`, 
			// 		response, 
			// 		`${moment().format("YYYY-MM-DD HH:mm:ss")}`,
			// 		`${interaction.message.id}`
			// 	]
			// });

			const vocabEmbedModalSubmitReply = new EmbedBuilder()
				.setColor(0x43B581)
				.setTitle('Word : ' + vocabWord)
				.setDescription(`<@!${interaction.user.tag}>'s **Example** \n*${response}*`)
				.setFooter({
					text: "Total spokken coins collected for vocab -",
			});

			await interaction.editReply({
				ephemeral: true, 
				embeds: [vocabEmbedModalSubmitReply], 
				components: []
			});
		}
	}
})


client.login(token);
  