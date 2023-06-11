import {EmbedBuilder} from "discord.js";
import SlashCommand from "../src/SlashCommand";

export = new SlashCommand(
	{
		description: "List of all commands",
	},
	async function* () {
		const helpEmbed = new EmbedBuilder().setDescription("List of all commands").setColor("#F8AA2A");

		for (const [name, {description}] of this.client.slashCommandsMap) {
			helpEmbed.addFields({
				name: `**${name}**`,
				value: `${description}`,
				inline: true,
			});
		}

		yield {
			content: `# ${this.client.user!.username} Help`,
			embeds: [
				helpEmbed.setAuthor({
					name: "Commands",
					iconURL:
						this.client.user!.avatarURL({
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
		};
	}
);
