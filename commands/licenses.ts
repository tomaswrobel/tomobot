import {EmbedBuilder} from "discord.js";
import {dependencies} from "../package.json";
import SlashCommand from "../src/SlashCommand";
import {join} from "path";

export = new SlashCommand({description: "See open-source licenses"}, async function* () {
	const embed = new EmbedBuilder();

	for (const name in dependencies) {
		const {description} = require(join(__dirname, "..", "node_modules", name, "package.json"));

		embed.addFields({
			name,
			value: `${
				description || "No description provided."
			}\n[View on npm](https://npmjs.com/package/${name})`,
		});
	}

	yield {
		content: `**${this.client.user?.username} would not be possible without the following open source projects:**\n\n`,
		embeds: [embed],
	};
});
