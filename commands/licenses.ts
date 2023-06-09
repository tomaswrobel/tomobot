import {EmbedBuilder} from "discord.js";
import {dependencies} from "../package.json";
import {bot} from "../index";
import SlashCommand from "../src/SlashCommand";

export = new SlashCommand({description: "See open-source licenses"}, async function* () {
	yield "Loading...";

	const embed = new EmbedBuilder();

	for (const name in dependencies) {
		const json = await import(`../node_modules/${name}/package.json`);

		let description = json.description || "No description provided.";

		if ("repository" in json) {
			description += `\n\n[View on GitHub](${json.repository})`;
		} else {
			description += `\n\n[View on npm](https://npmjs.com/package/${name})`;
		}

		embed.addFields({
			name,
			value: description,
		});
	}

	yield {
		content: `**${bot.client.user?.username}'s would not be possible without the following open source projects:**\n\n`,
		embeds: [embed],
	};
});
