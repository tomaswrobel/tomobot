import {
	CommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js";
import {i18n} from "../utils/i18n";
import {bot} from "../index";

export default {
	data: new SlashCommandBuilder()
		.setName("help")
		.setDescription(i18n.__("help.description")),
	async execute(interaction: CommandInteraction) {
		const helpEmbed = new EmbedBuilder()
			.setDescription(i18n.__("help.embedDescription"))
			.setColor("#F8AA2A");

		for (const {data} of bot.slashCommandsMap.values()) {
			helpEmbed.addFields({
				name: `**${data.name}**`,
				value: `${data.description}`,
				inline: true,
			});
		}

		return interaction
			.reply({
				content:
					"# " +
					i18n.__mf("help.embedTitle", {
						botname: interaction.client.user!.username,
					}),
				embeds: [
					helpEmbed.setAuthor({
						name: "Commands",
						iconURL:
							interaction.client.user!.avatarURL({
								size: 64,
							}) || undefined,
					}),
					new EmbedBuilder()
						.setAuthor({
							name: "TypeScript",
							iconURL:
								"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Typescript_logo_2020.svg/240px-Typescript_logo_2020.svg.png",
						})
						.setDescription(
							"If your message includes only TypeScript code block, it will be evaluated. Just type \n```\n`\u200B``ts\n\n`\u200B``\n```  and paste your code inside. Example:\n```ts\nconsole.log('Hello world!')\n```\nYou have access to `console` and you can use top-level await. Also, `console.read()` can be used to read user input."
						),
					new EmbedBuilder()
						.setAuthor({
							name: "JavaScript",
							iconURL:
								"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/JavaScript-logo.png/240px-JavaScript-logo.png",
						})
						.setDescription(
							"If your message includes only JavaScript code block, it will be evaluated. Just type \n```\n`\u200B``js\n\n`\u200B``\n```  and paste your code inside. Example:\n```ts\nconsole.log('Hello world!')\n```\nYou have access to `console` and you can use top-level await. Also, `console.read()` can be used to read user input."
						),
				],
			})
			.catch(console.error);
	},
};
